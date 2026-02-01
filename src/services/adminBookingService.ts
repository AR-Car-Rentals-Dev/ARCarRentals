import { supabase } from './supabase';

export interface Booking {
  id: string;
  booking_number: string;
  user_id?: string | null;
  vehicle_id: string;
  pickup_date: string;
  return_date: string;
  pickup_location?: string;
  return_location?: string;
  total_days: number;
  base_price: number;
  extras_price?: number;
  discount_amount?: number;
  total_price: number;
  deposit_paid?: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  extras?: any;
  created_at: string;
  updated_at: string;
  // Guest booking fields
  customer_name?: string;
  customer_phone: string;
  customer_email?: string;
  drive_option?: 'self-drive' | 'with-driver';
  start_time?: string;
  end_time?: string;
  payment_method?: 'pay_now' | 'pay_later';
  payment_receipt_url?: string;
  location_cost?: number;
  driver_cost?: number;
  pickup_delivery_location?: string;
  // Joined data
  users?: {
    full_name: string;
    email: string;
    phone_number: string;
  } | null;
  vehicles?: {
    brand: string;
    model: string;
    thumbnail?: string;
    image_url?: string;
  } | null;
  // Computed for display
  total_amount?: number;
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

/**
 * Booking management service
 */
export const bookingService = {
  /**
   * Get all bookings with user and vehicle details
   */
  async getAll(): Promise<{ data: Booking[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          users:user_id (full_name, email, phone_number),
          vehicles:vehicle_id (brand, model, thumbnail, image_url)
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
          users:user_id (full_name, email, phone_number),
          vehicles:vehicle_id (brand, model, thumbnail, image_url)
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
        .select('status, total_price');

      if (error) {
        console.error('Error fetching booking stats:', error);
        return { data: null, error: error.message };
      }

      const stats: BookingStats = {
        total: data?.length || 0,
        pending: data?.filter((b) => b.status === 'pending').length || 0,
        confirmed: data?.filter((b) => b.status === 'confirmed').length || 0,
        active: data?.filter((b) => b.status === 'active').length || 0,
        completed: data?.filter((b) => b.status === 'completed').length || 0,
        cancelled: data?.filter((b) => b.status === 'cancelled').length || 0,
        totalRevenue: data?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0,
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
          users:user_id (full_name, email, phone_number),
          vehicles:vehicle_id (brand, model, thumbnail, image_url)
        `);

      if (status && status !== 'all') {
        queryBuilder = queryBuilder.eq('status', status);
      }

      if (query) {
        queryBuilder = queryBuilder.or(`booking_number.ilike.%${query}%,customer_name.ilike.%${query}%,customer_phone.ilike.%${query}%`);
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
};

export default bookingService;
