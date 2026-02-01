import { type FC, useState, useRef, useEffect } from 'react';
import {
  Car,
  DollarSign,
  Settings2,
  Loader2,
  Upload,
  X,
  Save,
} from 'lucide-react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { supabase } from '@services/supabase';

interface VehicleInput {
  id: string;
  brand?: string;
  model?: string;
  category_id?: string | null;
  color?: string | null;
  transmission?: string;
  fuel_type?: string;
  seats?: number;
  features?: string[] | any;
  thumbnail?: string | null;
  image_url?: string | null;
  price_per_day?: number;
  status?: 'available' | 'rented' | 'maintenance';
  description?: string | null;
}

interface EditVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  vehicle: VehicleInput | null;
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
}

/**
 * Edit Vehicle Modal - Simplified version
 */
export const EditVehicleModal: FC<EditVehicleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  vehicle,
}) => {
  const [formData, setFormData] = useState<VehicleFormData>({
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
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Load vehicle data when modal opens
  useEffect(() => {
    if (vehicle && isOpen) {
      // Parse features - handle both array and JSON formats
      let featuresStr = '';
      if (vehicle.features) {
        if (Array.isArray(vehicle.features)) {
          featuresStr = vehicle.features.join(', ');
        } else if (typeof vehicle.features === 'string') {
          featuresStr = vehicle.features;
        }
      }

      setFormData({
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        category_id: vehicle.category_id || '',
        color: vehicle.color || '',
        transmission: (vehicle.transmission as 'automatic' | 'manual') || 'automatic',
        fuel_type: (vehicle.fuel_type as 'gasoline' | 'diesel' | 'hybrid' | 'electric') || 'gasoline',
        seats: vehicle.seats?.toString() || '5',
        features: featuresStr,
        image_url: vehicle.image_url || vehicle.thumbnail || '',
        price_per_day: vehicle.price_per_day?.toString() || '',
        status: vehicle.status || 'available',
      });
      setImagePreview(vehicle.image_url || vehicle.thumbnail || '');
      setImageFile(null);
    }
  }, [vehicle, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image_url: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return formData.image_url || null;

    setUploadingImage(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `vehicles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('vehicle-images')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('vehicle-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      return formData.image_url || null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vehicle?.id) return;

    // Validation
    if (!formData.brand.trim()) {
      setError('Brand is required');
      return;
    }
    if (!formData.model.trim()) {
      setError('Model is required');
      return;
    }
    if (!formData.price_per_day || parseFloat(formData.price_per_day) <= 0) {
      setError('Valid price per day is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Upload image first if selected
      const imageUrl = await uploadImage();

      // Parse features to array
      const featuresArray = formData.features
        ? formData.features.split(',').map((f) => f.trim()).filter(Boolean)
        : [];

      const { error: updateError } = await supabase
        .from('vehicles')
        .update({
          brand: formData.brand,
          model: formData.model,
          category_id: formData.category_id || null,
          color: formData.color || null,
          transmission: formData.transmission,
          fuel_type: formData.fuel_type,
          seats: parseInt(formData.seats) || 5,
          features: featuresArray,
          image_url: imageUrl,
          thumbnail: imageUrl,
          price_per_day: parseFloat(formData.price_per_day),
          status: formData.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', vehicle.id);

      if (updateError) throw updateError;

      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Error updating vehicle:', err);
      setError(err.message || 'Failed to update vehicle. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setImageFile(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Vehicle" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-neutral-700 font-medium">
            <Car className="h-5 w-5" />
            <span>Basic Information</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Brand *"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="e.g., Toyota"
            />
            <Input
              label="Model *"
              name="model"
              value={formData.model}
              onChange={handleChange}
              placeholder="e.g., Vios"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Category
              </label>
              {loadingCategories ? (
                <div className="w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 text-neutral-500">
                  Loading...
                </div>
              ) : (
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
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

        {/* Specifications */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-neutral-700 font-medium">
            <Settings2 className="h-5 w-5" />
            <span>Specifications</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Transmission
              </label>
              <select
                name="transmission"
                value={formData.transmission}
                onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Fuel Type
              </label>
              <select
                name="fuel_type"
                value={formData.fuel_type}
                onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="gasoline">Gasoline</option>
                <option value="diesel">Diesel</option>
                <option value="hybrid">Hybrid</option>
                <option value="electric">Electric</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Seats"
              name="seats"
              type="number"
              value={formData.seats}
              onChange={handleChange}
              min="1"
              max="20"
            />
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
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
              placeholder="e.g., GPS, Bluetooth, Backup Camera"
              rows={2}
              className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
            />
          </div>
        </div>

        {/* Image & Pricing */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-neutral-700 font-medium">
            <DollarSign className="h-5 w-5" />
            <span>Image & Pricing</span>
          </div>

          {/* Image Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-700">
              Vehicle Image
            </label>
            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden border border-neutral-200">
                <img
                  src={imagePreview}
                  alt="Vehicle preview"
                  className="w-full h-40 object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 px-3 py-1.5 bg-white text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-100 transition-colors border"
                >
                  Change
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-colors"
              >
                <Upload className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                <p className="text-neutral-600 text-sm">Click to upload</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          <Input
            label="Or paste Image URL"
            name="image_url"
            value={formData.image_url}
            onChange={(e) => {
              handleChange(e);
              if (e.target.value) {
                setImagePreview(e.target.value);
                setImageFile(null);
              }
            }}
            placeholder="https://example.com/image.jpg"
          />

          <Input
            label="Price per Day (₱) *"
            name="price_per_day"
            type="number"
            value={formData.price_per_day}
            onChange={handleChange}
            placeholder="2500"
            min="0"
            step="100"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || uploadingImage}
            className="bg-primary-600 hover:bg-primary-700"
          >
            {isLoading || uploadingImage ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {uploadingImage ? 'Uploading...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditVehicleModal;
