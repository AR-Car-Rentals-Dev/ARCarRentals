import { type FC, useState, useEffect } from 'react';
import {
  Loader2,
  X,
  Car,
  Star,
} from 'lucide-react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { MultiImageUpload, type ImageUploadItem } from './MultiImageUpload';
import { supabase } from '@services/supabase';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface VehicleCategory {
  id: string;
  name: string;
  description?: string;
}

interface VehicleFormData {
  brand: string;
  model: string;
  category_id: string;
  color: string;
  transmission: 'automatic' | 'manual';
  fuel_type: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  seats: string;
  features: string;
  image_url: string;
  price_per_day: string;
  status: 'available' | 'rented' | 'maintenance';
  is_featured: boolean;
}

const initialFormData: VehicleFormData = {
  brand: '',
  model: '',
  category_id: '',
  color: '',
  transmission: 'automatic',
  fuel_type: 'gasoline',
  seats: '5',
  features: '',
  image_url: '',
  price_per_day: '',
  status: 'available',
  is_featured: false,
};

/**
 * Add Vehicle Modal - Single View Two Column Layout
 */
export const AddVehicleModal: FC<AddVehicleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<VehicleFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicleImages, setVehicleImages] = useState<ImageUploadItem[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch vehicle categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const { data, error } = await supabase
          .from('vehicle_categories')
          .select('*')
          .order('name');
        
        if (error) throw error;
        setCategories(data || []);
        
        // Set default category if available
        if (data && data.length > 0 && !formData.category_id) {
          setFormData(prev => ({ ...prev, category_id: data[0].id }));
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    setError(null);
    
    if (!formData.brand.trim()) {
      setError('Brand is required');
      return false;
    }
    if (!formData.model.trim()) {
      setError('Model is required');
      return false;
    }
    if (!formData.category_id) {
      setError('Vehicle category is required');
      return false;
    }
    if (!formData.price_per_day || parseFloat(formData.price_per_day) <= 0) {
      setError('Valid price per day is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Parse features to array
      const featuresArray = formData.features
        ? formData.features.split(',').map((f) => f.trim()).filter(Boolean)
        : [];

      // Get primary image URL (first image) for backward compatibility
      const primaryImageUrl = vehicleImages.length > 0 ? vehicleImages[0].url : null;

      // Insert vehicle and get its ID
      const { data: vehicleData, error: insertError } = await supabase
        .from('vehicles')
        .insert({
          brand: formData.brand,
          model: formData.model,
          category_id: formData.category_id || null,
          color: formData.color || null,
          transmission: formData.transmission,
          fuel_type: formData.fuel_type,
          seats: formData.seats || '5',
          features: featuresArray,
          image_url: primaryImageUrl,
          price_per_day: parseFloat(formData.price_per_day),
          status: formData.status,
          is_featured: formData.is_featured,
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      // Insert vehicle images if any
      if (vehicleData && vehicleImages.length > 0) {
        const imageRecords = vehicleImages.map((img, index) => ({
          vehicle_id: vehicleData.id,
          image_url: img.url,
          is_primary: index === 0, // First image is primary
          display_order: index,
        }));

        const { error: imagesError } = await supabase
          .from('vehicle_images')
          .insert(imageRecords);

        if (imagesError) {
          console.error('Error saving vehicle images:', imagesError);
          // Don't throw - vehicle was created successfully
        }
      }

      setFormData(initialFormData);
      setVehicleImages([]);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Error adding vehicle:', err);
      setError(err.message || 'Failed to add vehicle. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setError(null);
    setVehicleImages([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Vehicle" size="2xl">
      <p className="text-sm text-neutral-500 mb-6">
        Fill in the details below to add a vehicle to your fleet.
      </p>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
          <X className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT COLUMN - Vehicle Details */}
        <div className="space-y-6">
          {/* Basic Info Section */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Car className="h-5 w-5 text-primary-600" />
              <h3 className="text-base font-semibold text-neutral-900">Basic Info</h3>
            </div>
            <div className="space-y-4">
              <Input
                label="Brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g. Toyota"
                required
              />
              <Input
                label="Model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g. Vios"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Vehicle Category <span className="text-red-500">*</span>
                  </label>
                  {loadingCategories ? (
                    <div className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 text-neutral-500 text-sm">
                      Loading...
                    </div>
                  ) : (
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <Input
                  label="Color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="e.g., White"
                />
              </div>
            </div>
          </div>

          {/* Specifications Section */}
          <div className="bg-white border border-neutral-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Car className="h-5 w-5 text-primary-600" />
              <h3 className="text-base font-semibold text-neutral-900">Specifications</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Transmission <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
                  >
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Fuel Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="fuel_type"
                    value={formData.fuel_type}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
                  >
                    <option value="gasoline">Gasoline</option>
                    <option value="diesel">Diesel</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="electric">Electric</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Seats"
                    name="seats"
                    type="text"
                    value={formData.seats}
                    onChange={handleChange}
                    placeholder="e.g. 5 or 7-8"
                    required
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Enter a single number (e.g., 5) or a range (e.g., 4-5, 7-8)
                  </p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
                  >
                    <option value="available">Available</option>
                    <option value="rented">Rented</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Features (comma-separated)
                </label>
                <textarea
                  name="features"
                  value={formData.features}
                  onChange={handleChange}
                  placeholder="e.g., GPS, Bluetooth, Backup Camera, Leather Seats"
                  rows={3}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Image & Pricing */}
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Car className="h-5 w-5 text-primary-600" />
              <h3 className="text-base font-semibold text-neutral-900">Vehicle Images & Pricing</h3>
            </div>

            {/* Multi-Image Upload */}
            <div className="mb-6">
              <MultiImageUpload
                images={vehicleImages}
                onChange={setVehicleImages}
                maxImages={10}
                disabled={isLoading}
              />
            </div>

            {/* Price Card */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6">
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Price per Day (₱) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-lg font-medium">₱</span>
                <input
                  type="number"
                  name="price_per_day"
                  value={formData.price_per_day}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="100"
                  className="w-full pl-10 pr-16 py-4 text-2xl font-bold text-neutral-900 bg-white border-2 border-neutral-300 rounded-xl focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-medium">/day</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-200">
        {/* Featured Toggle - Bottom Left */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, is_featured: !prev.is_featured }))}
            disabled={isLoading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              formData.is_featured ? 'bg-primary-600' : 'bg-neutral-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.is_featured ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <div className="flex items-center gap-2">
            <Star className={`h-4 w-4 ${
              formData.is_featured ? 'text-yellow-500 fill-yellow-500' : 'text-neutral-400'
            }`} />
            <span className="text-sm font-medium text-neutral-700">Featured Vehicle</span>
          </div>
        </div>

        {/* Action Buttons - Bottom Right */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-primary-600 hover:bg-primary-700 px-8"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Car className="h-4 w-4 mr-2" />
                Add Vehicle
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddVehicleModal;
