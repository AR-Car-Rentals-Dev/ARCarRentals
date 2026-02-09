/**
 * Leads Service - Handle saving and updating leads in Supabase
 * Captures abandoned booking information for follow-up
 * 
 * Lead Lifecycle:
 * 1. PENDING - User filled renter info, not yet paid
 * 2. RECOVERED - User completed payment (booking created)
 * 3. ABANDONED - User left without paying (set by cron after 60 min)
 */

import { supabase } from './supabase';

// Lead status constants
export const LEAD_STATUS = {
    PENDING: 'pending',
    RECOVERED: 'recovered',
    ABANDONED: 'abandoned',
} as const;

export type LeadStatus = typeof LEAD_STATUS[keyof typeof LEAD_STATUS];

// Last step constants
export const LEAD_STEP = {
    RENTER_INFO: 'renter_info',
    PAYMENT: 'payment',
    COMPLETED: 'completed',
} as const;

export type LeadStep = typeof LEAD_STEP[keyof typeof LEAD_STEP];

// Automation status constants
export const AUTOMATION_STATUS = {
    NOT_SENT: 'not_sent',
    SENT: 'sent',
    OPENED: 'opened',
    CLICKED: 'clicked',
} as const;

export interface LeadData {
    lead_name: string;
    email: string;
    phone: string;
    vehicle_id?: string;
    pickup_location?: string;
    dropoff_location?: string;
    pickup_date?: string;
    pickup_time?: string;
    return_date?: string;
    rental_days?: number;
    estimated_price?: number;
    drive_option?: 'self-drive' | 'with-driver' | '';
    last_step?: LeadStep;
}

export interface SaveLeadResponse {
    success: boolean;
    leadId?: string;
    error?: string;
}

// Session storage key for current lead ID
const LEAD_SESSION_KEY = 'ar_current_lead_id';

/**
 * Store lead ID in session storage
 */
export const storeLeadIdInSession = (leadId: string): void => {
    try {
        sessionStorage.setItem(LEAD_SESSION_KEY, leadId);
        console.log('📦 Lead ID stored in session:', leadId);
    } catch (e) {
        console.warn('⚠️ Failed to store lead ID in session:', e);
    }
};

/**
 * Get lead ID from session storage
 */
export const getLeadIdFromSession = (): string | null => {
    try {
        return sessionStorage.getItem(LEAD_SESSION_KEY);
    } catch (e) {
        console.warn('⚠️ Failed to get lead ID from session:', e);
        return null;
    }
};

/**
 * Clear lead ID from session storage
 */
export const clearLeadIdFromSession = (): void => {
    try {
        sessionStorage.removeItem(LEAD_SESSION_KEY);
        console.log('🧹 Lead ID cleared from session');
    } catch (e) {
        console.warn('⚠️ Failed to clear lead ID from session:', e);
    }
};

/**
 * Create a new lead when user submits renter info
 * Returns the lead ID for session storage
 */
export const createLead = async (leadData: LeadData): Promise<SaveLeadResponse> => {
    try {
        console.log('💾 Creating new lead in Supabase:', leadData.email);

        // Check if a lead already exists with same email and vehicle (to update instead)
        const { data: existingLead, error: fetchError } = await supabase
            .from('abandoned_leads')
            .select('id, status')
            .eq('email', leadData.email)
            .eq('vehicle_id', leadData.vehicle_id)
            .maybeSingle();

        if (fetchError) {
            console.error('❌ Error checking existing lead:', fetchError);
        }

        // If lead exists and is already recovered, don't create new
        if (existingLead?.status === LEAD_STATUS.RECOVERED) {
            console.log('ℹ️ Lead already recovered, skipping');
            return { success: true, leadId: existingLead.id };
        }

        // Prepare lead record
        const leadRecord = {
            lead_name: leadData.lead_name,
            email: leadData.email.toLowerCase(),
            phone: leadData.phone,
            vehicle_id: leadData.vehicle_id || null,
            pickup_location: leadData.pickup_location || null,
            dropoff_location: leadData.dropoff_location || null,
            pickup_date: leadData.pickup_date || null,
            pickup_time: leadData.pickup_time || null,
            return_date: leadData.return_date || null,
            rental_days: leadData.rental_days || null,
            estimated_price: leadData.estimated_price || null,
            drive_option: leadData.drive_option || null,
            last_step: leadData.last_step || LEAD_STEP.RENTER_INFO,
            drop_off_timestamp: new Date().toISOString(),
            status: LEAD_STATUS.PENDING,
            automation_status: AUTOMATION_STATUS.NOT_SENT,
        };

        let result;

        if (existingLead) {
            // Update existing lead (refresh timestamp)
            console.log('📝 Updating existing lead:', existingLead.id);
            result = await supabase
                .from('abandoned_leads')
                .update(leadRecord)
                .eq('id', existingLead.id)
                .select('id')
                .single();
        } else {
            // Insert new lead
            console.log('➕ Creating new lead');
            result = await supabase
                .from('abandoned_leads')
                .insert(leadRecord)
                .select('id')
                .single();
        }

        if (result.error) {
            console.error('❌ Error saving lead:', result.error);
            return { success: false, error: result.error.message };
        }

        const leadId = result.data?.id;
        console.log('✅ Lead saved successfully:', leadId);

        // Store in session
        if (leadId) {
            storeLeadIdInSession(leadId);
        }

        return { success: true, leadId };

    } catch (error) {
        console.error('❌ Error in createLead:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

/**
 * Update lead step (e.g., when user proceeds to payment)
 */
export const updateLeadStep = async (leadId: string, lastStep: LeadStep): Promise<boolean> => {
    try {
        console.log('📝 Updating lead step:', leadId, '->', lastStep);

        const { error } = await supabase
            .from('abandoned_leads')
            .update({
                last_step: lastStep,
                drop_off_timestamp: new Date().toISOString(),
            })
            .eq('id', leadId);

        if (error) {
            console.error('❌ Error updating lead step:', error);
            return false;
        }

        console.log('✅ Lead step updated');
        return true;
    } catch (error) {
        console.error('❌ Error in updateLeadStep:', error);
        return false;
    }
};

/**
 * Mark a lead as RECOVERED when booking is completed
 */
export const markLeadAsRecovered = async (
    bookingId: string,
    leadId?: string | null
): Promise<boolean> => {
    try {
        // Get lead ID from session if not provided
        const id = leadId || getLeadIdFromSession();

        if (!id) {
            console.log('ℹ️ No lead ID found, skipping recovery update');
            return false;
        }

        console.log('🎉 Marking lead as recovered:', id, '-> booking:', bookingId);

        const { error } = await supabase
            .from('abandoned_leads')
            .update({
                status: LEAD_STATUS.RECOVERED,
                recovered_booking_id: bookingId,
                last_step: LEAD_STEP.COMPLETED,
            })
            .eq('id', id);

        if (error) {
            console.error('❌ Error marking lead as recovered:', error);
            return false;
        }

        console.log('✅ Lead marked as recovered');

        // Clear from session
        clearLeadIdFromSession();

        return true;
    } catch (error) {
        console.error('❌ Error in markLeadAsRecovered:', error);
        return false;
    }
};

/**
 * Debounce helper for lead saving
 */
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

export const debouncedSaveLead = (leadData: LeadData, delayMs = 2000): void => {
    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(() => {
        createLead(leadData);
    }, delayMs);
};

/**
 * Cancel any pending debounced save
 */
export const cancelPendingSave = (): void => {
    if (saveTimeout) {
        clearTimeout(saveTimeout);
        saveTimeout = null;
    }
};

// Legacy export for backwards compatibility
export const saveOrUpdateLead = createLead;
