import { type FC, useState, useRef, useEffect } from 'react';
import {
  Loader2,
  Upload,
  X,
  Image as ImageIcon,
  Car,
} from 'lucide-react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
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
    // If no file selected, return the URL from the input field
    if (!imageFile) {
      return formData.image_url?.trim() || null;
    }

    setUploadingImage(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `vehicles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('vehicle-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        // If bucket doesn't exist or upload fails, use URL from input as fallback
        return formData.image_url?.trim() || null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('vehicle-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      // Fallback to URL input if upload fails
      return formData.image_url?.trim() || null;
    } finally {
      setUploadingImage(false);
    }
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
      // Upload image first if selected
      const imageUrl = await uploadImage();

      // Parse features to array
      const featuresArray = formData.features
        ? formData.features.split(',').map((f) => f.trim()).filter(Boolean)
        : [];

      const { error: insertError } = await supabase.from('vehicles').insert({
        brand: formData.brand,
        model: formData.model,
        category_id: formData.category_id || null,
        color: formData.color || null,
        transmission: formData.transmission,
        fuel_type: formData.fuel_type,
        seats: formData.seats.includes('-') ? formData.seats : (parseInt(formData.seats) || 5),
        features: featuresArray,
        image_url: imageUrl,
        price_per_day: parseFloat(formData.price_per_day),
        status: formData.status,
      });

      if (insertError) throw insertError;

      setFormData(initialFormData);
      setImageFile(null);
      setImagePreview('');
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
    setImageFile(null);
    setImagePreview('');
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
              <ImageIcon className="h-5 w-5 text-primary-600" />
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
                    Enter a single number (e.g., 5) or a range (e.g., 7-8, 13-15)
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
              <Upload className="h-5 w-5 text-primary-600" />
              <h3 className="text-base font-semibold text-neutral-900">Vehicle Image & Pricing</h3>
            </div>

            {/* Image Upload Zone */}
            <div className="mb-6">
              {imagePreview || formData.image_url ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-neutral-200 group">
                  <img
                    src={imagePreview || formData.image_url}
                    alt="Vehicle preview"
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-white text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-100 transition-colors"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-neutral-300 rounded-xl p-12 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/30 transition-all group"
                >
                  <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-100 transition-colors">
                    <Upload className="h-8 w-8 text-primary-600" />
                  </div>
                  <p className="text-neutral-700 font-medium mb-1">Click or drag file to upload</p>
                  <p className="text-neutral-500 text-sm">PNG, JPG up to 5MB</p>
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

            {/* OR Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-neutral-500 uppercase tracking-wide">OR USE URL</span>
              </div>
            </div>

            {/* URL Input */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="h-4 w-4 text-neutral-600" />
                </div>
                <Input
                  name="image_url"
                  value={formData.image_url}
                  onChange={(e) => {
                    handleChange(e);
                    if (e.target.value) {
                      setImagePreview(e.target.value);
                      setImageFile(null);
                    }
                  }}
                  placeholder="https://example.com/car-image.jpg"
                  className="flex-1"
                />
              </div>
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
      <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-neutral-200">
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
          disabled={isLoading || uploadingImage}
          className="bg-primary-600 hover:bg-primary-700 px-8"
        >
          {isLoading || uploadingImage ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {uploadingImage ? 'Uploading...' : 'Adding...'}
            </>
          ) : (
            <>
              <Car className="h-4 w-4 mr-2" />
              Add Vehicle
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
};

export default AddVehicleModal;
