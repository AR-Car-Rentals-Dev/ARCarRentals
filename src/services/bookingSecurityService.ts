/**
 * Secure booking service with Supabase integration
 */

import { supabase } from './supabase';
import { sendMagicLinkEmail } from './emailService';
import { 
  generateBookingReference, 
  generateMagicToken, 
  hashToken,
  calculateExpiryDate,
  isTokenExpired 
} from '../utils/security';
import type { SearchCriteria, RenterInfo } from '../utils/sessionManager';
import type { Car } from '../types';

export interface BookingPayload {
  searchCriteria: SearchCriteria;
  vehicle: Car;
  renterInfo: RenterInfo;
  driveOption: 'self-drive' | 'with-driver';
  paymentType: 'full' | 'downpayment';
  paymentMethod: 'gcash' | 'maya' | 'bank-transfer';
  receiptImage: File;
}

export interface BookingResponse {
  success: boolean;
  bookingId: string;
  bookingReference: string;
  magicLink: string;
  error?: string;
}

/**
 * Create a new booking with secure magic link
 */
export const createSecureBooking = async (payload: BookingPayload): Promise<BookingResponse> => {
  try {
    // Generate booking reference
    const bookingReference = generateBookingReference();
    
    // Generate magic token
    const magicToken = generateMagicToken();
    const tokenHash = await hashToken(magicToken);
    
    // Calculate token expiry
    const expiryDate = calculateExpiryDate(payload.searchCriteria.returnDate);
    
    // Calculate total amount
    const dailyRate = payload.driveOption === 'with-driver' 
      ? payload.vehicle.pricePerDay + 500
      : payload.vehicle.pricePerDay;
    
    const days = calculateDays(payload.searchCriteria.pickupDate, payload.searchCriteria.returnDate);
    const totalAmount = dailyRate * days;
    const amountPaid = payload.paymentType === 'downpayment' ? 500 : totalAmount;
    
    console.log('📝 Creating booking with data:', {
      bookingReference,
      vehicleId: payload.vehicle.id,
      pickupDate: payload.searchCriteria.pickupDate,
      returnDate: payload.searchCriteria.returnDate,
      days,
      totalAmount,
      amountPaid
    });
    
    // Upload receipt image first
    console.log('📤 Uploading receipt...');
    const receiptUrl = await uploadReceipt(payload.receiptImage, bookingReference);
    console.log('✅ Receipt uploaded:', receiptUrl);
    
    // Insert customer
    console.log('👤 Creating customer...');
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        full_name: payload.renterInfo.fullName,
        email: payload.renterInfo.email,
        contact_number: payload.renterInfo.phoneNumber,
        address: payload.searchCriteria.pickupLocation
      })
      .select()
      .single();
    
    if (customerError) {
      console.error('❌ Customer creation failed:', customerError);
      throw customerError;
    }
    console.log('✅ Customer created:', customer.id);
    
    // Insert booking
    console.log('📅 Creating booking...');
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        booking_reference: bookingReference,
        customer_id: customer.id,
        vehicle_id: payload.vehicle.id,
        pickup_location: payload.searchCriteria.pickupLocation,
        start_date: payload.searchCriteria.pickupDate,
        start_time: payload.searchCriteria.startTime,
        pickup_time: payload.searchCriteria.startTime,
        rental_days: days,
        total_amount: totalAmount,
        booking_status: 'pending',
        magic_token_hash: tokenHash,
        token_expires_at: expiryDate,
        agreed_to_terms: true
      })
      .select()
      .single();
    
    if (bookingError) {
      console.error('❌ Booking creation failed:', bookingError);
      console.error('Full error details:', JSON.stringify(bookingError, null, 2));
      throw bookingError;
    }
    console.log('✅ Booking created:', booking.id);
    
    // Insert payment
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id: booking.id,
        amount: amountPaid,
        payment_type: payload.paymentType,
        payment_method: payload.paymentMethod,
        payment_status: 'pending',
        payment_proof_url: receiptUrl,
        receipt_url: receiptUrl
      });
    
    if (paymentError) throw paymentError;
    
    // Generate magic link
    const magicLink = `${window.location.origin}/browsevehicles/track/${bookingReference}?t=${magicToken}`;
    
    // Send pending booking email (awaiting admin confirmation)
    console.log('📧 Sending pending booking email via Supabase Edge Function...');
    const emailResult = await sendMagicLinkEmail(
      payload.renterInfo.email,
      bookingReference,
      magicLink,
      {
        vehicleName: payload.vehicle.name,
        pickupDate: new Date(payload.searchCriteria.pickupDate).toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        returnDate: new Date(payload.searchCriteria.returnDate).toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        })
      },
      'pending' // Email type: pending admin approval
    );
    
    if (emailResult.success) {
      console.log('✅ Pending booking email sent successfully');
    } else {
      console.warn('⚠️ Failed to send email:', emailResult.error);
      console.log('💡 Booking completed successfully. Customer can use magic link from confirmation page.');
    }
    
    return {
      success: true,
      bookingId: booking.id,
      bookingReference,
      magicLink
    };
  } catch (error) {
    console.error('Failed to create booking:', error);
    return {
      success: false,
      bookingId: '',
      bookingReference: '',
      magicLink: '',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Verify magic link token
 */
export const verifyMagicToken = async (
  bookingReference: string, 
  token: string
): Promise<{ valid: boolean; bookingId?: string; error?: string }> => {
  try {
    // Hash the token
    const tokenHash = await hashToken(token);
    
    // Find booking by reference and token hash
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('id, token_expires_at')
      .eq('booking_reference', bookingReference)
      .eq('magic_token_hash', tokenHash)
      .single();
    
    if (error) {
      return { valid: false, error: 'Invalid or expired link' };
    }
    
    // Check if token is expired
    if (isTokenExpired(booking.token_expires_at)) {
      return { valid: false, error: 'Link has expired' };
    }
    
    return { valid: true, bookingId: booking.id };
  } catch (error) {
    console.error('Failed to verify token:', error);
    return { valid: false, error: 'Verification failed' };
  }
};

/**
 * Get booking details by reference (without token - for receipt submitted page)
 */
export const getBookingByReference = async (bookingReference: string) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(*),
        vehicle:vehicles(*),
        payment:payments(*)
      `)
      .eq('booking_reference', bookingReference)
      .single();
    
    if (error) throw error;
    return { success: true, booking: data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Get booking details by ID (with verified token - for tracking page)
 */
export const getBookingById = async (bookingId: string) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(*),
        vehicle:vehicles(*),
        payment:payments(*)
      `)
      .eq('id', bookingId)
      .single();
    
    if (error) throw error;
    return { success: true, booking: data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Upload receipt to Supabase storage
 */
const uploadReceipt = async (file: File, bookingReference: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${bookingReference}_${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('receipts')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  if (error) throw error;
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('receipts')
    .getPublicUrl(data.path);
  
  return publicUrl;
};

/**
 * Calculate number of days between two dates
 */
const calculateDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Generate magic link URL for a booking reference
 * Used when admin confirms booking and needs to send confirmation email
 */
export const getMagicLinkFromBooking = (bookingReference: string): string => {
  // For admin confirmations, we don't have the magic token
  // The customer can still use their original magic link from pending email
  // Or they can track booking without magic link (just with booking reference)
  return `${window.location.origin}/browsevehicles/track/${bookingReference}`;
};
