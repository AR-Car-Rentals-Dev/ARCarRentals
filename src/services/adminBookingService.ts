import { supabase } from './supabase';

export interface Customer {
  id: string;
  full_name: string;
  email: string;
  contact_number: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  booking_reference: string;
  customer_id: string;
  vehicle_id: string;
  start_date: string;
  start_time?: string;
  rental_days: number;
  pickup_location?: string;
  pickup_time?: string;
  total_amount: number;
  booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refund_pending' | 'refunded';
  created_at: string;
  updated_at: string;
  magic_token_hash?: string;
  token_expires_at?: string;
  agreed_to_terms?: boolean;
  // Refund workflow fields
  cancellation_reason?: string;
  refund_status?: 'none' | 'pending' | 'completed';
  refund_reference_id?: string;
  refund_proof_url?: string;
  // Joined data
  customers?: Customer | null;
  vehicles?: {
    id: string;
    brand: string;
    model: string;
    image_url?: string;
  } | null;
}

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  active: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
}

export interface CreateBookingData {
  // Customer info
  customer_name: string;
  customer_email: string;
  customer_contact_number: string;
  customer_address?: string;
  // Booking info
  vehicle_id: string;
  start_date: string;
  start_time?: string;
  rental_days: number;
  pickup_location?: string;
  pickup_time?: string;
  total_amount: number;
}

/**
 * Booking management service
 */
export const bookingService = {
  /**
   * Get all bookings with customer and vehicle details
   */
  async getAll(): Promise<{ data: Booking[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customers:customer_id (id, full_name, email, contact_number, address, created_at, updated_at),
          vehicles:vehicle_id (id, brand, model, image_url)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
        return { data: null, error: error.message };
      }

      // Map total_price to total_amount for display
      const mappedData = data?.map(b => ({
        ...b,
        total_amount: b.total_price || 0
      })) || null;

      return { data: mappedData, error: null };
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      return { data: null, error: error.message || 'Failed to fetch bookings' };
    }
  },

  /**
   * Get recent bookings (limit to last N)
   */
  async getRecent(limit: number = 5): Promise<{ data: Booking[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customers:customer_id (id, full_name, email, contact_number, address, created_at, updated_at),
          vehicles:vehicle_id (id, brand, model, image_url)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent bookings:', error);
        return { data: null, error: error.message };
      }

      // Map total_price to total_amount for display
      const mappedData = data?.map(b => ({
        ...b,
        total_amount: b.total_price || 0
      })) || null;

      return { data: mappedData, error: null };
    } catch (error: any) {
      console.error('Error fetching recent bookings:', error);
      return { data: null, error: error.message || 'Failed to fetch recent bookings' };
    }
  },

  /**
   * Get booking statistics
   */
  async getStats(): Promise<{ data: BookingStats | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('booking_status, total_amount');

      if (error) {
        console.error('Error fetching booking stats:', error);
        return { data: null, error: error.message };
      }

      const stats: BookingStats = {
        total: data?.length || 0,
        pending: data?.filter((b) => b.booking_status === 'pending').length || 0,
        confirmed: data?.filter((b) => b.booking_status === 'confirmed').length || 0,
        active: 0, // Not used in current schema
        completed: data?.filter((b) => b.booking_status === 'completed').length || 0,
        cancelled: data?.filter((b) => b.booking_status === 'cancelled').length || 0,
        totalRevenue: data?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0,
      };

      return { data: stats, error: null };
    } catch (error: any) {
      console.error('Error fetching booking stats:', error);
      return { data: null, error: error.message || 'Failed to fetch stats' };
    }
  },

  /**
   * Search bookings
   */
  async search(query: string, status?: string): Promise<{ data: Booking[] | null; error: string | null }> {
    try {
      let queryBuilder = supabase
        .from('bookings')
        .select(`
          *,
          customers:customer_id (id, full_name, email, contact_number, address, created_at, updated_at),
          vehicles:vehicle_id (id, brand, model, image_url)
        `);

      if (status && status !== 'all') {
        queryBuilder = queryBuilder.eq('booking_status', status);
      }

      if (query) {
        queryBuilder = queryBuilder.or(`booking_reference.ilike.%${query}%`);
      }

      const { data, error } = await queryBuilder.order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching bookings:', error);
        return { data: null, error: error.message };
      }

      // Map total_price to total_amount for display
      const mappedData = data?.map(b => ({
        ...b,
        total_amount: b.total_price || 0
      })) || null;

      return { data: mappedData, error: null };
    } catch (error: any) {
      console.error('Error searching bookings:', error);
      return { data: null, error: error.message || 'Failed to search bookings' };
    }
  },

  /**
   * Create a new booking with customer
   * This will create or update the customer first, then create the booking
   */
  async create(bookingData: CreateBookingData): Promise<{ data: Booking | null; error: string | null }> {
    try {
      // Step 1: Check if customer exists by email or phone
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .or(`email.eq.${bookingData.customer_email},contact_number.eq.${bookingData.customer_contact_number}`)
        .limit(1)
        .single();

      let customerId: string;

      if (existingCustomer) {
        // Update existing customer
        const { data: updatedCustomer, error: updateError } = await supabase
          .from('customers')
          .update({
            full_name: bookingData.customer_name,
            email: bookingData.customer_email,
            contact_number: bookingData.customer_contact_number,
            address: bookingData.customer_address,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingCustomer.id)
          .select('id')
          .single();

        if (updateError) {
          console.error('Error updating customer:', updateError);
          return { data: null, error: updateError.message };
        }

        customerId = updatedCustomer!.id;
      } else {
        // Create new customer
        const { data: newCustomer, error: createError } = await supabase
          .from('customers')
          .insert({
            full_name: bookingData.customer_name,
            email: bookingData.customer_email,
            contact_number: bookingData.customer_contact_number,
            address: bookingData.customer_address,
          })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating customer:', createError);
          return { data: null, error: createError.message };
        }

        customerId = newCustomer!.id;
      }

      // Step 2: Generate booking reference
      const bookingReference = `BK${Date.now()}`;

      // Step 3: Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          booking_reference: bookingReference,
          customer_id: customerId,
          vehicle_id: bookingData.vehicle_id,
          start_date: bookingData.start_date,
          start_time: bookingData.start_time,
          rental_days: bookingData.rental_days,
          pickup_location: bookingData.pickup_location,
          pickup_time: bookingData.pickup_time,
          total_amount: bookingData.total_amount,
          booking_status: 'pending',
        })
        .select(`
          *,
          customers:customer_id (id, full_name, email, contact_number, address, created_at, updated_at),
          vehicles:vehicle_id (id, brand, model, image_url)
        `)
        .single();

      if (bookingError) {
        console.error('Error creating booking:', bookingError);
        return { data: null, error: bookingError.message };
      }

      return { data: booking as Booking, error: null };
    } catch (error: any) {
      console.error('Error creating booking:', error);
      return { data: null, error: error.message || 'Failed to create booking' };
    }
  },

  /**
   * Update booking status
   * Note: Vehicle status is NO LONGER changed to 'rented' when booking is confirmed.
   * This is because vehicles are now always shown as available, with booked date ranges
   * being blocked in the calendar during booking.
   */
  async updateStatus(id: string, status: Booking['booking_status'], _updateVehicleStatus?: boolean): Promise<{ data: Booking | null; error: string | null }> {
    try {
      // Update booking status
      const { data, error } = await supabase
        .from('bookings')
        .update({ booking_status: status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`
          *,
          customers:customer_id (id, full_name, email, contact_number, address, created_at, updated_at),
          vehicles:vehicle_id (id, brand, model, image_url)
        `)
        .single();

      if (error) {
        console.error('Error updating booking status:', error);
        return { data: null, error: error.message };
      }

      // Note: We no longer set vehicle status to 'rented' when confirmed
      // Vehicles are always shown with booked dates blocked in calendar

      return { data: data as Booking, error: null };
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      return { data: null, error: error.message || 'Failed to update booking status' };
    }
  },

  /**
   * Confirm payment and set booking to active
   */
  async confirmPayment(bookingId: string, paymentId: string): Promise<{ error: string | null }> {
    try {
      // Update payment status
      const { error: paymentError } = await supabase
        .from('payments')
        .update({ 
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (paymentError) {
        console.error('Error updating payment status:', paymentError);
        return { error: paymentError.message };
      }

      // Update booking status to active
      const { error: bookingError } = await this.updateStatus(bookingId, 'confirmed', true);

      if (bookingError) {
        return { error: bookingError };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      return { error: error.message || 'Failed to confirm payment' };
    }
  },

  /**
   * Delete a booking
   */
  async delete(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting booking:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Error deleting booking:', error);
      return { error: error.message || 'Failed to delete booking' };
    }
  },

  /**
   * Decline booking with cancellation (for fake/invalid payment)
   * Sets status to 'cancelled' with reason
   */
  async declineWithCancellation(
    id: string, 
    reason: string
  ): Promise<{ data: Booking | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ 
          booking_status: 'cancelled',
          cancellation_reason: reason,
          refund_status: 'none',
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select(`
          *,
          customers:customer_id (id, full_name, email, contact_number, address, created_at, updated_at),
          vehicles:vehicle_id (id, brand, model, image_url)
        `)
        .single();

      if (error) {
        console.error('Error declining booking:', error);
        return { data: null, error: error.message };
      }

      return { data: data as Booking, error: null };
    } catch (error: any) {
      console.error('Error declining booking:', error);
      return { data: null, error: error.message || 'Failed to decline booking' };
    }
  },

  /**
   * Decline booking with refund pending (for valid payment but unavailable car)
   * Sets status to 'refund_pending' with reason
   */
  async declineWithRefundPending(
    id: string, 
    reason: string
  ): Promise<{ data: Booking | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ 
          booking_status: 'refund_pending',
          cancellation_reason: reason,
          refund_status: 'pending',
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select(`
          *,
          customers:customer_id (id, full_name, email, contact_number, address, created_at, updated_at),
          vehicles:vehicle_id (id, brand, model, image_url)
        `)
        .single();

      if (error) {
        console.error('Error setting refund pending:', error);
        return { data: null, error: error.message };
      }

      return { data: data as Booking, error: null };
    } catch (error: any) {
      console.error('Error setting refund pending:', error);
      return { data: null, error: error.message || 'Failed to set refund pending' };
    }
  },

  /**
   * Complete refund and mark booking as refunded
   * Requires refund reference and proof URL
   */
  async completeRefund(
    id: string,
    refundReferenceId: string,
    refundProofUrl: string
  ): Promise<{ data: Booking | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ 
          booking_status: 'refunded',
          refund_status: 'completed',
          refund_reference_id: refundReferenceId,
          refund_proof_url: refundProofUrl,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select(`
          *,
          customers:customer_id (id, full_name, email, contact_number, address, created_at, updated_at),
          vehicles:vehicle_id (id, brand, model, image_url)
        `)
        .single();

      if (error) {
        console.error('Error completing refund:', error);
        return { data: null, error: error.message };
      }

      return { data: data as Booking, error: null };
    } catch (error: any) {
      console.error('Error completing refund:', error);
      return { data: null, error: error.message || 'Failed to complete refund' };
    }
  },

  /**
   * Decline booking with immediate refund (one-step process)
   * For valid payment, car unavailable, and immediate refund proof provided
   */
  async declineWithRefund(
    id: string,
    reason: string,
    refundReferenceId: string,
    refundProofUrl: string
  ): Promise<{ data: Booking | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ 
          booking_status: 'refunded',
          cancellation_reason: reason,
          refund_status: 'completed',
          refund_reference_id: refundReferenceId,
          refund_proof_url: refundProofUrl,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select(`
          *,
          customers:customer_id (id, full_name, email, contact_number, address, created_at, updated_at),
          vehicles:vehicle_id (id, brand, model, image_url)
        `)
        .single();

      if (error) {
        console.error('Error declining with refund:', error);
        return { data: null, error: error.message };
      }

      return { data: data as Booking, error: null };
    } catch (error: any) {
      console.error('Error declining with refund:', error);
      return { data: null, error: error.message || 'Failed to decline with refund' };
    }
  },

  /**
   * Get booked date ranges for a specific vehicle
   * Returns confirmed bookings to block those dates from being selected
   */
  async getVehicleBookedDates(vehicleId: string): Promise<{ data: { startDate: Date; endDate: Date }[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('start_date, rental_days')
        .eq('vehicle_id', vehicleId)
        .in('booking_status', ['confirmed', 'pending']); // Include both confirmed and pending to avoid double bookings

      if (error) {
        console.error('Error fetching vehicle booked dates:', error);
        return { data: null, error: error.message };
      }

      // Transform to date ranges
      const bookedRanges = data?.map(booking => {
        const startDate = new Date(booking.start_date);
        const endDate = new Date(booking.start_date);
        endDate.setDate(endDate.getDate() + booking.rental_days);
        return { startDate, endDate };
      }) || [];

      return { data: bookedRanges, error: null };
    } catch (error: any) {
      console.error('Error fetching vehicle booked dates:', error);
      return { data: null, error: error.message || 'Failed to fetch booked dates' };
    }
  },
};

export default bookingService;
