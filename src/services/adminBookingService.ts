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
  booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
  magic_token_hash?: string;
  token_expires_at?: string;
  agreed_to_terms?: boolean;
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
   */
  async updateStatus(id: string, status: Booking['booking_status']): Promise<{ data: Booking | null; error: string | null }> {
    try {
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

      return { data: data as Booking, error: null };
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      return { data: null, error: error.message || 'Failed to update booking status' };
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
};

export default bookingService;
