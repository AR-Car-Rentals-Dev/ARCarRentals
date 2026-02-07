import { supabase } from './supabase';

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  category_id?: string | null;
  type?: string;
  transmission: string;
  fuel_type: string;
  seats: number | string;
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
        .select(`
          *,
          vehicle_categories:category_id (id, name)
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch images for all vehicles
      const vehicleIds = (data || []).map((v: Vehicle) => v.id);
      let imagesMap: Record<string, string[]> = {};
      
      if (vehicleIds.length > 0) {
        const { data: imagesData } = await supabase
          .from('vehicle_images')
          .select('vehicle_id, image_url, is_primary, display_order')
          .in('vehicle_id', vehicleIds)
          .order('is_primary', { ascending: false })
          .order('display_order', { ascending: true });
        
        if (imagesData) {
          imagesMap = imagesData.reduce((acc: Record<string, string[]>, img: any) => {
            if (!acc[img.vehicle_id]) {
              acc[img.vehicle_id] = [];
            }
            acc[img.vehicle_id].push(img.image_url);
            return acc;
          }, {});
        }
      }
      
      // Map to Car type
      const vehicles = (data || []).map((vehicle: Vehicle) => {
        const vehicleImages = imagesMap[vehicle.id] || [];
        const primaryImage = vehicleImages.length > 0 
          ? vehicleImages[0] 
          : vehicle.image_url || 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800&q=80';
        
        // Normalize category to lowercase to match CarCategory type
        const categoryName = vehicle.vehicle_categories?.name?.toLowerCase() || 'suv';
        const validCategory = ['sedan', 'suv', 'van'].includes(categoryName) ? categoryName : 'suv';
        
        return {
          id: vehicle.id,
          name: `${vehicle.brand} ${vehicle.model}`,
          brand: vehicle.brand,
          model: vehicle.model,
          year: new Date().getFullYear(),
          category: validCategory as 'sedan' | 'suv' | 'van',
          pricePerDay: Number(vehicle.price_per_day),
          currency: 'PHP',
          seats: vehicle.seats || '5',
          transmission: (vehicle.transmission?.toLowerCase() || 'automatic') as 'automatic' | 'manual',
          fuelType: (vehicle.fuel_type?.toLowerCase() || 'gasoline') as 'gasoline' | 'diesel' | 'electric' | 'hybrid',
          image: primaryImage,
          images: vehicleImages.length > 0 ? vehicleImages : (vehicle.image_url ? [vehicle.image_url] : []),
          features: Array.isArray(vehicle.features) ? vehicle.features : ['AC', 'Bluetooth'],
          available: vehicle.status === 'available',
          rating: 4.8,
          reviewCount: Math.floor(Math.random() * 150) + 50,
        };
      });
      
      return { data: vehicles, error: null };
    } catch (error: any) {
      console.error('Error fetching vehicles for browse:', error);
      return { data: [], error: error.message || 'Failed to fetch vehicles' };
    }
  },

  /**
   * Get images for a specific vehicle
   */
  async getVehicleImages(vehicleId: string): Promise<{ data: string[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('vehicle_images')
        .select('image_url, is_primary, display_order')
        .eq('vehicle_id', vehicleId)
        .order('is_primary', { ascending: false })
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching vehicle images:', error);
        return { data: null, error: error.message };
      }

      return { data: data?.map((img: any) => img.image_url) || [], error: null };
    } catch (error: any) {
      console.error('Error fetching vehicle images:', error);
      return { data: null, error: error.message || 'Failed to fetch vehicle images' };
    }
  },

  /**
   * Delete vehicle and all related data
   */
  async delete(vehicleId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // First, check if there are any bookings for this vehicle
      const { data: bookings, error: bookingsCheckError } = await supabase
        .from('bookings')
        .select('id')
        .eq('vehicle_id', vehicleId);

      if (bookingsCheckError) {
        console.error('Error checking bookings:', bookingsCheckError);
        return { success: false, error: 'Failed to check vehicle bookings' };
      }

      if (bookings && bookings.length > 0) {
        return { 
          success: false, 
          error: `Cannot delete vehicle with ${bookings.length} existing booking(s). Please cancel or complete all bookings first, or set the vehicle status to "Maintenance" instead.` 
        };
      }

      // Delete all vehicle images
      const { error: imagesError } = await supabase
        .from('vehicle_images')
        .delete()
        .eq('vehicle_id', vehicleId);

      if (imagesError) {
        console.error('Error deleting vehicle images:', imagesError);
        // Continue anyway - we still want to delete the vehicle
      }

      // Delete the vehicle
      const { error: vehicleError } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);

      if (vehicleError) {
        console.error('Error deleting vehicle:', vehicleError);
        return { success: false, error: vehicleError.message };
      }

      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error in delete operation:', error);
      return { success: false, error: error.message || 'Failed to delete vehicle' };
    }
  },
};

export default vehicleService;
