import { supabase } from './supabase';

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  category_id?: string | null;
  type?: string;
  transmission: string;
  fuel_type: string;
  seats: number;
  color?: string | null;
  price_per_day: number;
  status: 'available' | 'rented' | 'maintenance';
  image_url?: string | null;
  thumbnail?: string | null;
  features?: string[] | any;
  description?: string | null;
  is_featured?: boolean;
  created_at: string;
  updated_at: string;
  // Joined category data
  vehicle_categories?: {
    id: string;
    name: string;
  } | null;
}

export interface VehicleStats {
  total: number;
  available: number;
  rented: number;
  maintenance: number;
}

/**
 * Vehicle management service
 */
export const vehicleService = {
  /**
   * Get all vehicles with category
   */
  async getAll(): Promise<{ data: Vehicle[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          vehicle_categories:category_id (id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vehicles:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching vehicles:', error);
      return { data: null, error: error.message || 'Failed to fetch vehicles' };
    }
  },

  /**
   * Get vehicle by ID
   */
  async getById(id: string): Promise<{ data: Vehicle | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching vehicle:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching vehicle:', error);
      return { data: null, error: error.message || 'Failed to fetch vehicle' };
    }
  },

  /**
   * Get vehicle statistics
   */
  async getStats(): Promise<{ data: VehicleStats | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('status');

      if (error) {
        console.error('Error fetching vehicle stats:', error);
        return { data: null, error: error.message };
      }

      const stats: VehicleStats = {
        total: data?.length || 0,
        available: data?.filter((v) => v.status === 'available').length || 0,
        rented: data?.filter((v) => v.status === 'rented').length || 0,
        maintenance: data?.filter((v) => v.status === 'maintenance').length || 0,
      };

      return { data: stats, error: null };
    } catch (error: any) {
      console.error('Error fetching vehicle stats:', error);
      return { data: null, error: error.message || 'Failed to fetch stats' };
    }
  },

  /**
   * Search vehicles
   */
  async search(query: string, status?: string): Promise<{ data: Vehicle[] | null; error: string | null }> {
    try {
      let queryBuilder = supabase
        .from('vehicles')
        .select('*');

      if (status && status !== 'all') {
        queryBuilder = queryBuilder.eq('status', status);
      }

      const { data, error } = await queryBuilder
        .or(`brand.ilike.%${query}%,model.ilike.%${query}%,type.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching vehicles:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Error searching vehicles:', error);
      return { data: null, error: error.message || 'Failed to search vehicles' };
    }
  },

  /**
   * Get vehicles formatted for browse page (Car type)
   */
  async getAvailableForBrowse() {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Map to Car type
      const vehicles = (data || []).map((vehicle: Vehicle) => ({
        id: vehicle.id,
        name: `${vehicle.brand} ${vehicle.model}`,
        brand: vehicle.brand,
        model: vehicle.model,
        year: new Date().getFullYear(),
        category: mapVehicleCategory(vehicle.type || vehicle.category_id),
        pricePerDay: Number(vehicle.price_per_day),
        currency: 'PHP',
        seats: vehicle.seats || 5,
        transmission: (vehicle.transmission?.toLowerCase() || 'automatic') as 'automatic' | 'manual',
        fuelType: (vehicle.fuel_type?.toLowerCase() || 'gasoline') as 'gasoline' | 'diesel' | 'electric' | 'hybrid',
        image: vehicle.image_url || 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800&q=80',
        images: vehicle.image_url ? [vehicle.image_url] : [],
        features: Array.isArray(vehicle.features) ? vehicle.features : ['AC', 'Bluetooth'],
        available: vehicle.status === 'available',
        rating: 4.8,
        reviewCount: Math.floor(Math.random() * 150) + 50,
      }));
      
      return { data: vehicles, error: null };
    } catch (error: any) {
      console.error('Error fetching vehicles for browse:', error);
      return { data: [], error: error.message || 'Failed to fetch vehicles' };
    }
  },
};

/**
 * Map vehicle type/category to Car category
 */
const mapVehicleCategory = (type: string | null | undefined): 'sedan' | 'suv' | 'van' => {
  if (!type) return 'sedan';
  const t = type.toLowerCase();
  if (t.includes('suv')) return 'suv';
  if (t.includes('van')) return 'van';
  return 'sedan';
};

export default vehicleService;
