import { type FC, useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Fuel,
  Settings2,
  Car,
  Check,
  ArrowRight,
} from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { supabase } from '@services/supabase';

interface VehicleImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

interface VehicleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToBooking: () => void;
  vehicle: {
    id: string;
    name: string;
    brand: string;
    model: string;
    year?: number;
    category: string;
    pricePerDay: number;
    seats: number | string;
    transmission: string;
    fuelType: string;
    image: string;
    images?: string[];
    features?: string[];
    color?: string;
    description?: string;
  } | null;
}

/**
 * Vehicle Details Modal - Shows vehicle information with image gallery
 * Displays when user clicks "Book Now" on a vehicle card
 */
export const VehicleDetailsModal: FC<VehicleDetailsModalProps> = ({
  isOpen,
  onClose,
  onProceedToBooking,
  vehicle,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [vehicleImages, setVehicleImages] = useState<string[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  // Fetch vehicle images from database
  useEffect(() => {
    const fetchVehicleImages = async () => {
      if (!vehicle?.id || !isOpen) return;

      setIsLoadingImages(true);
      setCurrentImageIndex(0);

      try {
        // Try to fetch images from vehicle_images table
        const { data: images, error } = await supabase
          .from('vehicle_images')
          .select('*')
          .eq('vehicle_id', vehicle.id)
          .order('is_primary', { ascending: false })
          .order('display_order', { ascending: true });

        if (error) {
          console.error('Error fetching vehicle images:', error);
          // Fallback to single image from vehicle prop
          setVehicleImages(vehicle.image ? [vehicle.image] : []);
          return;
        }

        if (images && images.length > 0) {
          // Use images from database
          setVehicleImages(images.map((img: VehicleImage) => img.image_url));
        } else if (vehicle.images && vehicle.images.length > 0) {
          // Fallback to images from prop
          setVehicleImages(vehicle.images);
        } else if (vehicle.image) {
          // Fallback to single image
          setVehicleImages([vehicle.image]);
        } else {
          setVehicleImages([]);
        }
      } catch (err) {
        console.error('Error fetching vehicle images:', err);
        // Fallback
        setVehicleImages(vehicle.image ? [vehicle.image] : []);
      } finally {
        setIsLoadingImages(false);
      }
    };

    fetchVehicleImages();
  }, [vehicle?.id, isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentImageIndex(0);
      setVehicleImages([]);
    }
  }, [isOpen]);

  if (!vehicle) return null;

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? vehicleImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === vehicleImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleProceedToBooking = () => {
    onProceedToBooking();
  };

  // Default features if not provided
  const features = vehicle.features || ['Air Conditioning', 'Bluetooth', 'USB Port'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Image Gallery */}
        <div className="lg:w-1/2">
          {/* Main Image Display */}
          <div className="relative bg-neutral-100 rounded-xl overflow-hidden aspect-[4/3]">
            {/* Category Badge - Inside Image, Top Left */}
            <span className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold text-white bg-[#e53935] rounded-full shadow-sm z-10 flex-shrink-0">
              {vehicle.category}
            </span>

            {isLoadingImages ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              </div>
            ) : vehicleImages.length > 0 ? (
              <>
                <img
                  src={vehicleImages[currentImageIndex]}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80';
                  }}
                />

                {/* Navigation Arrows - Only show if more than 1 image */}
                {vehicleImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5 text-neutral-700" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5 text-neutral-700" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {vehicleImages.length > 1 && (
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {currentImageIndex + 1} / {vehicleImages.length}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                <Car className="w-16 h-16" />
              </div>
            )}
          </div>

          {/* Thumbnail Strip - Only show if more than 1 image */}
          {vehicleImages.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-neutral-300">
              {vehicleImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex
                      ? 'border-primary-500 ring-2 ring-primary-200'
                      : 'border-transparent hover:border-neutral-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${vehicle.brand} ${vehicle.model} - view ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=100&q=60';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Vehicle Details */}
        <div className="lg:w-1/2 flex flex-col">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-neutral-900">
              {vehicle.brand} {vehicle.model}
            </h2>
          </div>

          {/* Price */}
          <div className="bg-primary-50 rounded-xl p-4 mb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-primary-600">
                ₱{vehicle.pricePerDay.toLocaleString()}
              </span>
              <span className="text-neutral-500 text-sm">/day</span>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-neutral-50 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">Specifications</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Settings2 className="w-5 h-5 text-neutral-600" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Transmission</p>
                  <p className="text-sm font-medium text-neutral-900 capitalize">
                    {vehicle.transmission}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Users className="w-5 h-5 text-neutral-600" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Capacity</p>
                  <p className="text-sm font-medium text-neutral-900">
                    {vehicle.seats} Seats
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Fuel className="w-5 h-5 text-neutral-600" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Fuel Type</p>
                  <p className="text-sm font-medium text-neutral-900 capitalize">
                    {vehicle.fuelType}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          {features.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-neutral-700 mb-3">Features</h3>
              <div className="flex flex-wrap gap-2">
                {features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {vehicle.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-neutral-700 mb-2">Description</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {vehicle.description}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-auto pt-4 border-t border-neutral-200 flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 py-3"
            >
              Close
            </Button>
            <Button
              variant="primary"
              onClick={handleProceedToBooking}
              className="flex-1 bg-primary-600 hover:bg-primary-700 py-3"
            >
              Proceed
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default VehicleDetailsModal;
