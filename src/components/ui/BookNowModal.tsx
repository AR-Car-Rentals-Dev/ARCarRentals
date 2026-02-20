import { type FC, useState, useEffect, useRef } from 'react';
import {
  Car,
  User,
  FileText,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Calendar,
  MapPin,
  Phone,
  AlertTriangle,
  UserCheck,
  Check,
  Filter,
  Eye,
  X,
  CreditCard,
  Upload,
  Smartphone,
  Copy,
  Info,
  Building2,
} from 'lucide-react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { supabase } from '@services/supabase';
import { bookingService as adminBookingService } from '@services/adminBookingService';

interface BookNowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  /** Pre-selected vehicle - if provided, modal starts at step 2 (Drive Option) */
  selectedVehicle?: {
    id: string;
    name: string;
    brand: string;
    model: string;
    year: number;
    category: string;
    pricePerDay: number;
    seats: number;
    transmission: string;
    fuelType: string;
    image?: string;
  } | null;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  type: string;
  transmission: string;
  fuel_type: string;
  seats: number;
  price_per_day: number;
  image_url?: string;
  thumbnail?: string;
  status: string;
  description?: string;
  features?: string[];
}

interface BookingFormData {
  // Vehicle
  vehicle_id: string;
  vehicle: Vehicle | null;
  
  // Drive Option
  drive_option: 'self-drive' | 'with-driver' | '';
  
  // Customer Details
  name: string;
  email: string;
  contact_number: string;
  rent_start_date: string;
  rent_start_time: string;
  rental_days: number;
  rent_end_date: string;
  rent_end_time: string;
  pickup_delivery_location: 'lapu-lapu' | 'mandaue' | 'cebu' | '';
  
  // Agreement
  agreed_to_terms: boolean;
  
  // Payment
  payment_method: 'pay_now' | 'pay_later' | '';
  payment_receipt: File | null;
  receipt_preview: string;
}

// Pickup/Delivery location costs
const LOCATION_COSTS: Record<string, { label: string; cost: number }> = {
  'lapu-lapu': { label: 'Lapu-Lapu', cost: 600 },
  'mandaue': { label: 'Mandaue', cost: 700 },
  'cebu': { label: 'Cebu', cost: 900 },
};

// Driver cost
const DRIVER_COST = {
  base: 1000, // 12 hours
  baseHours: 12,
  excessPerHour: 150,
};

const initialFormData: BookingFormData = {
  vehicle_id: '',
  vehicle: null,
  drive_option: '',
  name: '',
  email: '',
  contact_number: '',
  rent_start_date: '',
  rent_start_time: '08:00',
  rental_days: 1,
  rent_end_date: '',
  rent_end_time: '08:00',
  pickup_delivery_location: '',
  agreed_to_terms: false,
  payment_method: '',
  payment_receipt: null,
  receipt_preview: '',
};

const STEPS = [
  { id: 1, title: 'Select Vehicle', icon: Car },
  { id: 2, title: 'Drive Option', icon: UserCheck },
  { id: 3, title: 'Your Details', icon: User },
  { id: 4, title: 'Terms & Conditions', icon: FileText },
  { id: 5, title: 'Payment', icon: CreditCard },
];

const WASH_RATES: Record<string, number> = {
  sedan: 300,
  suv: 400,
  van: 450,
};

const VEHICLE_CATEGORIES = [
  { value: '', label: 'All Vehicles' },
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'van', label: 'Van' },
];

// GCash Payment Details
const GCASH_DETAILS = {
  name: 'Rolando Torred Jr',
  number: '0956 662 5224',
  // To add your own QR code: Save your GCash QR image to public/gcash-qr.png
  // Then change qrCode to: '/gcash-qr.png'
  qrCode: '/gcash-qr.png',
};

/**
 * Book Now Modal with Step-by-Step Wizard
 */
export const BookNowModal: FC<BookNowModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  selectedVehicle,
}) => {
  // If a vehicle is pre-selected, start at step 2 (Drive Option)
  const initialStep = selectedVehicle ? 2 : 1;
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [formData, setFormData] = useState<BookingFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedVehicleDetails, setSelectedVehicleDetails] = useState<Vehicle | null>(null);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);
  // Collapsible payment sections
  const [paymentMethodExpanded, setPaymentMethodExpanded] = useState(true);
  const [sendPaymentExpanded, setSendPaymentExpanded] = useState(true);
  const [uploadExpanded, setUploadExpanded] = useState(true);
  const termsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Copy phone number to clipboard
  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text.replace(/\s/g, ''));
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  // Handle pre-selected vehicle
  useEffect(() => {
    if (isOpen && selectedVehicle) {
      // Convert the Car type to Vehicle type for the form
      const vehicleData: Vehicle = {
        id: selectedVehicle.id,
        make: selectedVehicle.brand,
        model: selectedVehicle.model,
        year: selectedVehicle.year,
        type: selectedVehicle.category,
        transmission: selectedVehicle.transmission,
        fuel_type: selectedVehicle.fuelType,
        seats: selectedVehicle.seats,
        price_per_day: selectedVehicle.pricePerDay,
        image_url: selectedVehicle.image,
        status: 'available',
      };
      setFormData(prev => ({
        ...prev,
        vehicle_id: selectedVehicle.id,
        vehicle: vehicleData,
      }));
      setCurrentStep(2);
    } else if (isOpen && !selectedVehicle) {
      setCurrentStep(1);
    }
  }, [isOpen, selectedVehicle]);

  // Pre-fill user data if logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch profile to pre-fill customer details
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone_number')
          .eq('id', user.id)
          .single();

        if (profile) {
          setFormData(prev => ({
            ...prev,
            email: user.email || '',
            name: profile.full_name || prev.name,
            contact_number: profile.phone_number || prev.contact_number,
          }));
        } else {
          setFormData(prev => ({ ...prev, email: user.email || '' }));
        }
      }
    };
    if (isOpen) {
      checkAuth();
      fetchAvailableVehicles();
    }
  }, [isOpen]);

  // Calculate end date when start date or rental days change
  useEffect(() => {
    if (formData.rent_start_date && formData.rental_days > 0) {
      const startDate = new Date(formData.rent_start_date);
      startDate.setDate(startDate.getDate() + formData.rental_days);
      const endDate = startDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, rent_end_date: endDate }));
    }
  }, [formData.rent_start_date, formData.rental_days]);

  const fetchAvailableVehicles = async () => {
    setLoadingVehicles(true);
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'available')
        .order('price_per_day', { ascending: true });

      if (error) throw error;
      setVehicles(data || []);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      // Set mock data for demo - using proper UUIDs
      setVehicles([
        {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          make: 'Toyota',
          model: 'Vios',
          year: 2023,
          type: 'sedan',
          transmission: 'Automatic',
          fuel_type: 'Gasoline',
          seats: 5,
          price_per_day: 1800,
          image_url: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=400&q=80',
          status: 'available',
          description: 'Fuel-efficient and comfortable sedan, perfect for city driving and short trips.',
          features: ['Air Conditioning', 'Bluetooth', 'USB Port', 'Backup Camera'],
        },
        {
          id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
          make: 'Toyota',
          model: 'Fortuner',
          year: 2023,
          type: 'suv',
          transmission: 'Automatic',
          fuel_type: 'Diesel',
          seats: 7,
          price_per_day: 3500,
          image_url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&q=80',
          status: 'available',
          description: 'Powerful and spacious SUV, ideal for family trips and off-road adventures.',
          features: ['Air Conditioning', 'Leather Seats', '4x4', 'Navigation', 'Sunroof'],
        },
        {
          id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
          make: 'Toyota',
          model: 'Hiace',
          year: 2022,
          type: 'van',
          transmission: 'Manual',
          fuel_type: 'Diesel',
          seats: 15,
          price_per_day: 4500,
          image_url: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=400&q=80',
          status: 'available',
          description: 'Spacious van perfect for group travel and tours around Cebu.',
          features: ['Air Conditioning', 'PA System', 'Large Luggage Space', 'Comfortable Seats'],
        },
        {
          id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
          make: 'Honda',
          model: 'City',
          year: 2023,
          type: 'sedan',
          transmission: 'Automatic',
          fuel_type: 'Gasoline',
          seats: 5,
          price_per_day: 1600,
          image_url: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=400&q=80',
          status: 'available',
          description: 'Compact and efficient sedan with modern features.',
          features: ['Air Conditioning', 'Apple CarPlay', 'Android Auto', 'Cruise Control'],
        },
        {
          id: 'e5f6a7b8-c9d0-1234-efab-345678901234',
          make: 'Mitsubishi',
          model: 'Montero Sport',
          year: 2023,
          type: 'suv',
          transmission: 'Automatic',
          fuel_type: 'Diesel',
          seats: 7,
          price_per_day: 3200,
          image_url: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=400&q=80',
          status: 'available',
          description: 'Premium SUV with powerful performance and luxury features.',
          features: ['Air Conditioning', 'Leather Seats', '4x4', 'Keyless Entry', 'Push Start'],
        },
      ]);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const filteredVehicles = selectedCategory
    ? vehicles.filter(v => v.type?.toLowerCase() === selectedCategory.toLowerCase())
    : vehicles;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setFormData(prev => ({
      ...prev,
      vehicle_id: vehicle.id,
      vehicle: vehicle,
    }));
  };

  const handleDriveOptionSelect = (option: 'self-drive' | 'with-driver') => {
    setFormData(prev => ({
      ...prev,
      drive_option: option,
    }));
  };

  const handlePaymentMethodSelect = (method: 'pay_now' | 'pay_later') => {
    setFormData(prev => ({
      ...prev,
      payment_method: method,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        payment_receipt: file,
        receipt_preview: previewUrl,
      }));
    }
  };

  const handleTermsScroll = () => {
    if (termsRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = termsRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setHasScrolledToBottom(true);
      }
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.vehicle_id;
      case 2:
        return !!formData.drive_option;
      case 3:
        // Your Details step
        return !!(
          formData.name &&
          formData.contact_number &&
          formData.rent_start_date &&
          formData.rental_days > 0 &&
          formData.pickup_delivery_location
        );
      case 4:
        // Terms & Conditions step
        return hasScrolledToBottom && formData.agreed_to_terms;
      case 5:
        // Payment step
        if (formData.payment_method === 'pay_now') {
          return !!formData.payment_receipt;
        }
        return !!formData.payment_method;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      const nextStep = Math.min(currentStep + 1, STEPS.length);
      setCurrentStep(nextStep);
      setError(null);
      // Reset payment section states when entering payment step
      if (nextStep === 5) {
        setPaymentMethodExpanded(true);
        setSendPaymentExpanded(true);
        setUploadExpanded(true);
      }
    } else {
      const messages: Record<number, string> = {
        1: 'Please select a vehicle',
        2: 'Please select a drive option',
        3: 'Please fill in all required fields',
        4: 'Please read the terms and check the agreement box',
        5: formData.payment_method === 'pay_now' 
          ? 'Please upload your payment receipt' 
          : 'Please select a payment method',
      };
      setError(messages[currentStep] || 'Please complete this step');
    }
  };

  const handleBack = () => {
    // If pre-selected vehicle, don't go back to step 1
    if (currentStep === 2 && selectedVehicle) {
      // Can't go back - vehicle was pre-selected
      return;
    }
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.contact_number) {
        setError('Phone number is required. Please go back and fill in your details.');
        setIsLoading(false);
        return;
      }
      
      // Calculate costs
      const vehicleCost = formData.vehicle ? formData.vehicle.price_per_day * formData.rental_days : 0;
      const locationCost = formData.pickup_delivery_location ? LOCATION_COSTS[formData.pickup_delivery_location]?.cost || 0 : 0;
      const driverCost = formData.drive_option === 'with-driver' ? DRIVER_COST.base * formData.rental_days : 0;
      const totalAmount = vehicleCost + locationCost + driverCost;

      // Prepare booking data using the new schema structure
      const bookingData = {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_contact_number: formData.contact_number,
        vehicle_id: formData.vehicle_id,
        start_date: formData.rent_start_date,
        start_time: formData.rent_start_time || undefined,
        rental_days: formData.rental_days,
        pickup_location: formData.pickup_delivery_location ? LOCATION_COSTS[formData.pickup_delivery_location]?.label : 'Cebu',
        pickup_time: formData.rent_start_time || undefined,
        total_amount: totalAmount,
      };

      // Create booking using the admin booking service (creates customer + booking)
      const { data: insertedBooking, error: insertError } = await adminBookingService.create(bookingData);

      if (insertError || !insertedBooking) {
        console.error('Booking error:', insertError);
        throw new Error(insertError || 'Failed to create booking');
      }

      // Upload receipt if exists
      if (formData.payment_receipt && insertedBooking) {
        try {
          const fileExt = formData.payment_receipt.name.split('.').pop();
          const fileName = `${insertedBooking.id}-${Date.now()}.${fileExt}`;
          const filePath = `payment-receipts/${fileName}`;

          console.log('Uploading receipt:', fileName);

          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('bookings')
            .upload(filePath, formData.payment_receipt, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('Error uploading receipt:', uploadError);
            console.error('Upload error details:', uploadError.message);
            // Don't fail the booking, just log the error
          } else {
            console.log('Receipt uploaded successfully:', uploadData);
            
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('bookings')
              .getPublicUrl(filePath);

            console.log('Public URL:', publicUrl);

            // Update booking with receipt URL
            const { data: updateData, error: updateError } = await supabase
              .from('bookings')
              .update({ payment_receipt_url: publicUrl })
              .eq('id', insertedBooking.id)
              .select();

            if (updateError) {
              console.error('Error updating booking with receipt URL:', updateError);
              console.error('Update error message:', updateError.message);
              console.error('Update error details:', JSON.stringify(updateError, null, 2));
            } else {
              console.log('Booking updated with receipt URL successfully');
              console.log('Updated booking data:', updateData);
            }
          }
        } catch (uploadErr) {
          console.error('Error processing receipt upload:', uploadErr);
          // Don't fail the booking
        }
      }

      setBookingComplete(true);
      onSuccess?.();
    } catch (err: unknown) {
      console.error('Error submitting booking:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit booking. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setCurrentStep(1);
    setError(null);
    setHasScrolledToBottom(false);
    setSelectedCategory('');
    setSelectedVehicleDetails(null);
    setBookingComplete(false);
    onClose();
  };

  const progress = (currentStep / STEPS.length) * 100;

  const getWashRate = () => {
    if (!formData.vehicle || !formData.vehicle.type) return 300;
    return WASH_RATES[formData.vehicle.type.toLowerCase()] || 300;
  };

  const getLocationCost = () => {
    if (!formData.pickup_delivery_location) return 0;
    return LOCATION_COSTS[formData.pickup_delivery_location]?.cost || 0;
  };

  const getDriverCost = () => {
    if (formData.drive_option !== 'with-driver') return 0;
    // Base cost for 12 hours per day
    return DRIVER_COST.base * formData.rental_days;
  };

  const getTotalAmount = () => {
    if (!formData.vehicle) return 0;
    const vehicleCost = formData.vehicle.price_per_day * formData.rental_days;
    const locationCost = getLocationCost();
    const driverCost = getDriverCost();
    return vehicleCost + locationCost + driverCost;
  };

  // Render Booking Complete Screen
  if (bookingComplete) {
    const bookingRef = `BK-${Date.now().toString(36).toUpperCase()}`;
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="" size="md">
        <div className="text-center">
          {/* Success Header with Dark Theme */}
          <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-xl p-6 mb-6 -mx-2 -mt-2">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Booking Submitted!</h2>
            <p className="text-neutral-300 text-sm">
              {formData.payment_method === 'pay_now' 
                ? 'Payment receipt is being verified'
                : 'Please prepare your payment for pickup'}
            </p>
          </div>

          {/* Booking Reference Card */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-4 mb-6 text-white">
            <p className="text-sm text-primary-100 mb-1">Booking Reference</p>
            <p className="text-2xl font-bold tracking-wider">{bookingRef}</p>
          </div>

          {/* Vehicle Summary */}
          <div className="bg-neutral-50 rounded-xl p-4 mb-6 text-left border border-neutral-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-neutral-200 rounded-lg flex items-center justify-center">
                <Car className="h-8 w-8 text-neutral-600" />
              </div>
              <div>
                <h4 className="font-bold text-neutral-900">
                  {formData.vehicle?.year} {formData.vehicle?.make} {formData.vehicle?.model}
                </h4>
                <p className="text-sm text-neutral-500">
                  {formData.rental_days} day(s) • {formData.drive_option === 'self-drive' ? 'Self-Drive' : 'With Driver'}
                </p>
                <p className="text-primary-600 font-bold mt-1">
                  Total: ₱{getTotalAmount().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          {/* What's Next */}
          <div className="bg-white rounded-xl p-4 mb-6 text-left border border-neutral-200">
            <h4 className="font-bold text-neutral-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              What's Next?
            </h4>
            <ul className="text-sm text-neutral-600 space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <span>Our admin will review and confirm your booking within 24 hours</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <span>You will receive a confirmation via SMS or email</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <span>Prepare your valid ID and driver's license for vehicle pickup</span>
              </li>
            </ul>
          </div>

          <Button onClick={handleClose} className="w-full bg-primary-600 hover:bg-primary-700 py-3">
            <CheckCircle className="h-4 w-4 mr-2" />
            Done
          </Button>
        </div>
      </Modal>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-xl p-4 mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Car className="h-5 w-5 text-primary-500" />
                Select Your Vehicle
              </h3>
              <p className="text-neutral-400 text-sm mt-1">Choose from our available fleet of well-maintained vehicles</p>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-neutral-500" />
              {VEHICLE_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            
            {loadingVehicles ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No vehicles available in this category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                {filteredVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className={`rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${
                      formData.vehicle_id === vehicle.id
                        ? 'border-primary-600 shadow-lg'
                        : 'border-neutral-200 hover:border-neutral-300 hover:shadow-md'
                    }`}
                  >
                    <div className="relative bg-neutral-100">
                      <img
                        src={vehicle.thumbnail || vehicle.image_url || 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=400&q=80'}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-full h-36 object-cover"
                        onClick={() => handleVehicleSelect(vehicle)}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=400&q=80';
                        }}
                      />
                      <span className="absolute top-2 left-2 px-2 py-1 bg-neutral-900/80 text-white text-xs rounded-full capitalize">
                        {vehicle.type}
                      </span>
                      {formData.vehicle_id === vehicle.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="p-3" onClick={() => handleVehicleSelect(vehicle)}>
                      <h4 className="font-semibold text-neutral-900">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h4>
                      <p className="text-xs text-neutral-500 mb-2">
                        {vehicle.transmission} • {vehicle.fuel_type} • {vehicle.seats} seats
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-primary-600 font-bold">
                          ₱{vehicle.price_per_day.toLocaleString()}<span className="text-xs font-normal">/day</span>
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVehicleDetails(vehicle);
                          }}
                          className="text-xs text-primary-600 hover:underline flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" /> View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Vehicle Details Modal */}
            {selectedVehicleDetails && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                  <div className="relative bg-neutral-100">
                    <img
                      src={selectedVehicleDetails.thumbnail || selectedVehicleDetails.image_url || 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=400&q=80'}
                      alt={`${selectedVehicleDetails.make} ${selectedVehicleDetails.model}`}
                      className="w-full h-48 object-cover rounded-t-2xl"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=400&q=80';
                      }}
                    />
                    <button
                      onClick={() => setSelectedVehicleDetails(null)}
                      className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-neutral-100 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-neutral-900">
                          {selectedVehicleDetails.year} {selectedVehicleDetails.make} {selectedVehicleDetails.model}
                        </h3>
                        <span className="inline-block px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-full capitalize mt-1">
                          {selectedVehicleDetails.type}
                        </span>
                      </div>
                      <p className="text-primary-600 font-bold text-xl">
                        ₱{selectedVehicleDetails.price_per_day.toLocaleString()}<span className="text-sm font-normal">/day</span>
                      </p>
                    </div>
                    
                    <p className="text-neutral-600 text-sm mb-4">
                      {selectedVehicleDetails.description || 'Well-maintained vehicle ready for your journey.'}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div className="bg-neutral-50 p-3 rounded-lg">
                        <p className="text-neutral-500">Transmission</p>
                        <p className="font-semibold">{selectedVehicleDetails.transmission}</p>
                      </div>
                      <div className="bg-neutral-50 p-3 rounded-lg">
                        <p className="text-neutral-500">Fuel Type</p>
                        <p className="font-semibold">{selectedVehicleDetails.fuel_type}</p>
                      </div>
                      <div className="bg-neutral-50 p-3 rounded-lg">
                        <p className="text-neutral-500">Seats</p>
                        <p className="font-semibold">{selectedVehicleDetails.seats} passengers</p>
                      </div>
                      <div className="bg-neutral-50 p-3 rounded-lg">
                        <p className="text-neutral-500">Status</p>
                        <p className="font-semibold text-green-600">Available</p>
                      </div>
                    </div>

                    {selectedVehicleDetails.features && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-neutral-700 mb-2">Features:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedVehicleDetails.features.map((feature, idx) => (
                            <span key={idx} className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={() => {
                        handleVehicleSelect(selectedVehicleDetails);
                        setSelectedVehicleDetails(null);
                      }}
                      className="w-full bg-primary-600 hover:bg-primary-700"
                    >
                      Select This Vehicle
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-xl p-4 mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Car className="h-5 w-5 text-primary-500" />
                How would you like to drive?
              </h3>
              <p className="text-neutral-400 text-sm mt-1">Select your preferred driving option</p>
            </div>

            {/* Self-Drive Option */}
            <div
              onClick={() => handleDriveOptionSelect('self-drive')}
              className={`p-5 rounded-xl border-2 cursor-pointer transition-all shadow-sm hover:shadow-md ${
                formData.drive_option === 'self-drive'
                  ? 'border-primary-600 bg-gradient-to-r from-primary-50 to-white shadow-primary-100'
                  : 'border-neutral-200 hover:border-primary-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    formData.drive_option === 'self-drive' ? 'bg-primary-600' : 'bg-neutral-100'
                  }`}>
                    <Car className={`h-6 w-6 ${formData.drive_option === 'self-drive' ? 'text-white' : 'text-neutral-600'}`} />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 text-lg">Self-Drive</h4>
                    <p className="text-sm text-neutral-500">Drive the vehicle yourself</p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  formData.drive_option === 'self-drive' 
                    ? 'border-primary-600 bg-primary-600' 
                    : 'border-neutral-300'
                }`}>
                  {formData.drive_option === 'self-drive' && <Check className="h-4 w-4 text-white" />}
                </div>
              </div>

              {formData.drive_option === 'self-drive' && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-900">
                      <strong>Note:</strong> You must present a valid (unexpired) driver's license upon vehicle turnover. 
                      The license will be verified by our staff before releasing the vehicle.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* With Driver Option */}
            <div
              onClick={() => handleDriveOptionSelect('with-driver')}
              className={`p-5 rounded-xl border-2 cursor-pointer transition-all shadow-sm hover:shadow-md ${
                formData.drive_option === 'with-driver'
                  ? 'border-primary-600 bg-gradient-to-r from-primary-50 to-white shadow-primary-100'
                  : 'border-neutral-200 hover:border-primary-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    formData.drive_option === 'with-driver' ? 'bg-primary-600' : 'bg-neutral-100'
                  }`}>
                    <UserCheck className={`h-6 w-6 ${formData.drive_option === 'with-driver' ? 'text-white' : 'text-neutral-600'}`} />
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 text-lg">With Driver</h4>
                    <p className="text-sm text-neutral-500">We'll assign a professional driver for you</p>
                    {formData.drive_option === 'with-driver' && (
                      <p className="text-xs text-primary-600 font-medium mt-1">
                        ₱{DRIVER_COST.base.toLocaleString()}/day ({DRIVER_COST.baseHours}hrs) • ₱{DRIVER_COST.excessPerHour}/exceeding hr
                      </p>
                    )}
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  formData.drive_option === 'with-driver' 
                    ? 'border-primary-600 bg-primary-600' 
                    : 'border-neutral-300'
                }`}>
                  {formData.drive_option === 'with-driver' && <Check className="h-4 w-4 text-white" />}
                </div>
              </div>

              {formData.drive_option === 'with-driver' && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-900">
                      <p><strong>Driver Rate:</strong> ₱{DRIVER_COST.base.toLocaleString()} for {DRIVER_COST.baseHours} hours per day</p>
                      <p className="mt-1"><strong>Exceeding Hours:</strong> ₱{DRIVER_COST.excessPerHour} per hour beyond {DRIVER_COST.baseHours} hours</p>
                      <p className="mt-2 text-xs text-amber-700">A professional driver will be assigned by our team based on availability.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-xl p-4 mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary-500" />
                Your Details
              </h3>
              <p className="text-neutral-400 text-sm mt-1">Please provide your booking information</p>
            </div>
            
            <div className="max-h-[380px] overflow-y-auto pr-2 space-y-4">
              <Input
                label="Full Name *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Juan Dela Cruz"
                leftIcon={<User className="h-4 w-4" />}
              />

              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                leftIcon={<MapPin className="h-4 w-4" />}
              />

              <Input
                label="Contact Number *"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                placeholder="09XX XXX XXXX"
                leftIcon={<Phone className="h-4 w-4" />}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Rent Start Date *"
                  name="rent_start_date"
                  type="date"
                  value={formData.rent_start_date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                />
                <Input
                  label="Start Time *"
                  name="rent_start_time"
                  type="time"
                  value={formData.rent_start_time}
                  onChange={handleChange}
                />
              </div>

              <Input
                label="How Many Days? *"
                name="rental_days"
                type="number"
                value={formData.rental_days.toString()}
                onChange={handleChange}
                min="1"
                leftIcon={<Calendar className="h-4 w-4" />}
              />

              {/* Pickup/Delivery Location Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-neutral-700">
                  Pickup/Delivery Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <select
                    name="pickup_delivery_location"
                    value={formData.pickup_delivery_location}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white appearance-none cursor-pointer"
                  >
                    <option value="">Select location</option>
                    {Object.entries(LOCATION_COSTS).map(([key, { label, cost }]) => (
                      <option key={key} value={key}>
                        {label} - ₱{cost.toLocaleString()}
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 rotate-90 pointer-events-none" />
                </div>
                <p className="text-xs text-neutral-500">Delivery/pickup charges apply based on location</p>
              </div>

              {/* Show selected location cost */}
              {formData.pickup_delivery_location && (
                <div className="p-3 bg-primary-50 border border-primary-100 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-600">Location Fee:</span>
                    <span className="font-semibold text-primary-600">
                      ₱{LOCATION_COSTS[formData.pickup_delivery_location]?.cost.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-xl p-4 mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary-500" />
                Terms & Conditions
              </h3>
              <p className="text-neutral-400 text-sm mt-1">Please read and accept the rental agreement</p>
            </div>

            <div
              ref={termsRef}
              onScroll={handleTermsScroll}
              className="h-[220px] overflow-y-auto border border-neutral-200 rounded-xl p-4 text-sm text-neutral-700 bg-white shadow-inner"
            >
              <h3 className="font-bold text-lg text-neutral-900 mb-4 text-center border-b pb-3">CAR RENTAL AGREEMENT</h3>
              
              <p className="mb-4">The kind renter hereby agrees to the terms & conditions stated in this form:</p>
              
              <ul className="list-disc pl-5 space-y-2 mb-6">
                <li>Renter states that he/she is over 18 years old, physically and legally qualified (with unexpired driver's license) to operate the vehicle.</li>
                <li>The renter hereby agrees that the unit is in good condition and free of any known defects/faults which would affect safety operations.</li>
                <li>The renter will use the unit for only personal and operate the vehicle only on properly maintained roads & parking lots; any of which unmentioned that is applicable to the law.</li>
                <li>Renter acknowledge that if a vehicle is involved in any traffic offense/accident, the renter agrees to be liable for any issue/s or payable imposed by the authorities or personnel involve during the unfortunate circumstance.</li>
                <li>Renter agrees to indemnify or secure, defend and hold the owner harmless for any loss, damage or legal actions against the owner as a result of renter's operation of the rented vehicle during the term of this agreement. (e.g. Attorney fees or penalties)</li>
                <li>Any lost item/equipment should be provided upon return nonetheless; the amount value of the lost items should be paid.</li>
                <li>The renter shall be liable for any damages or losses to the vehicle caused by their negligence or fault.</li>
              </ul>

              <h4 className="font-bold text-neutral-900 mb-3 text-red-600">RENTER SHOULD NOT USE THE UNIT & BE HELD FULL RESPONSIBLE OF THE FOLLOWING PENALTIES:</h4>
              
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Used the vehicle in negligent manner/under influence of alcohol or drugs</li>
                <li>Carry passengers or property for hire but for personal use only</li>
                <li>Used to push propel or tow another vehicle or items</li>
                <li>Used for race or any competition</li>
              </ul>

              <h4 className="font-bold text-neutral-900 mb-3">FINES</h4>
              <table className="w-full mb-6 text-sm">
                <tbody>
                  <tr className="border-b"><td className="py-2">Unlawful activities</td><td className="py-2 text-right font-semibold text-red-600">₱10,000</td></tr>
                  <tr className="border-b"><td className="py-2">Overseas use / outside island of Cebu</td><td className="py-2 text-right font-semibold text-red-600">₱10,000</td></tr>
                  <tr className="border-b"><td className="py-2">Unauthorized repairs</td><td className="py-2 text-right font-semibold text-red-600">₱10,000</td></tr>
                  <tr className="border-b"><td className="py-2">Any damages, dents or scratches</td><td className="py-2 text-right font-semibold text-red-600">₱4,500</td></tr>
                  <tr><td className="py-2">Smoking inside the car</td><td className="py-2 text-right font-semibold text-red-600">₱2,000</td></tr>
                </tbody>
              </table>

              <h4 className="font-bold text-neutral-900 mb-3">PROHIBITED USE</h4>
              <p className="mb-2">The renter agrees not to use the vehicle for any unlawful activities, including but not limited to:</p>
              <ul className="list-disc pl-5 space-y-1 mb-4">
                <li>Transporting illegal substances or contraband</li>
                <li>Committing a crime or felony</li>
                <li>Engaging in any activity that may cause damage to the vehicle or put others at risk</li>
              </ul>

              <h4 className="font-bold text-neutral-900 mb-3">ADDITIONAL REMINDERS</h4>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li><strong>Fuel:</strong> Return vehicle with same fuel level (₱300/bar if not)</li>
                <li><strong>Excess hours (late return):</strong> Sedan: ₱200/hr; MPV: ₱250/hr; SUV: ₱300/hr; Van: ₱350/hr</li>
              </ul>

              {formData.drive_option === 'self-drive' && (
                <>
                  <h4 className="font-bold text-neutral-900 mb-3 text-primary-600">SELF-DRIVE SPECIFIC REQUIREMENTS</h4>
                  <ul className="list-disc pl-5 space-y-2 mb-4">
                    <li><strong>Car Wash:</strong> Vehicle must be washed before return OR pay wash rate of ₱{getWashRate()}</li>
                    <li><strong>Payment:</strong> Full payment required upon turnover/delivery of unit</li>
                    <li><strong>Delivery/Pick-up:</strong> Available with additional charges based on location</li>
                    <li><strong>Gas Level:</strong> SAME GAS LEVEL UPON RETURN (₱300/bar if not fulfilled)</li>
                  </ul>
                </>
              )}

              <div className="text-center mt-8 pt-4 border-t">
                <p className="text-xs text-neutral-500">— End of Agreement —</p>
              </div>
            </div>

            <div className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all ${
              hasScrolledToBottom 
                ? 'bg-white border-primary-200 hover:border-primary-400' 
                : 'bg-neutral-50 border-neutral-200'
            }`}>
              <input
                type="checkbox"
                id="agree-terms"
                checked={formData.agreed_to_terms}
                onChange={(e) => setFormData(prev => ({ ...prev, agreed_to_terms: e.target.checked }))}
                disabled={!hasScrolledToBottom}
                className="mt-0.5 h-5 w-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
              />
              <label htmlFor="agree-terms" className={`text-sm ${!hasScrolledToBottom ? 'text-neutral-400' : 'text-neutral-700'}`}>
                <span className="font-medium">I have read and agree to the Car Rental Agreement and Terms & Conditions.</span>
                {!hasScrolledToBottom && <span className="block text-xs text-amber-600 mt-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Scroll to bottom to enable</span>}
              </label>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-3">
            {/* Section 1: Select Payment Method - Collapsible */}
            <div 
              onClick={() => !formData.payment_method ? null : setPaymentMethodExpanded(!paymentMethodExpanded)}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                formData.payment_method && !paymentMethodExpanded 
                  ? 'bg-green-50 border border-green-200 hover:bg-green-100' 
                  : 'bg-neutral-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  formData.payment_method ? 'bg-green-500 text-white' : 'bg-primary-600 text-white'
                }`}>
                  {formData.payment_method ? <Check className="h-3 w-3" /> : '1'}
                </div>
                <span className="text-sm font-semibold text-neutral-900 uppercase tracking-wide">Select Payment Method</span>
                {formData.payment_method && !paymentMethodExpanded && (
                  <span className="text-xs text-green-600 font-medium ml-2">
                    ({formData.payment_method === 'pay_now' ? 'GCASH' : 'Pay Later'})
                  </span>
                )}
              </div>
              {formData.payment_method && (
                <ChevronRight className={`h-4 w-4 text-neutral-500 transition-transform ${paymentMethodExpanded ? 'rotate-90' : ''}`} />
              )}
            </div>

            {paymentMethodExpanded && (
              <div className="flex gap-3">
                <button
                  onClick={() => { handlePaymentMethodSelect('pay_now'); setPaymentMethodExpanded(false); setSendPaymentExpanded(true); }}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    formData.payment_method === 'pay_now'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      formData.payment_method === 'pay_now' ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-neutral-900">GCASH</span>
                    {formData.payment_method === 'pay_now' && <Check className="h-4 w-4 text-primary-600" />}
                  </div>
                </button>

                <button
                  onClick={() => { handlePaymentMethodSelect('pay_later'); setPaymentMethodExpanded(false); }}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                    formData.payment_method === 'pay_later'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      formData.payment_method === 'pay_later' ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      <Building2 className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-neutral-900">Pay Later</span>
                    {formData.payment_method === 'pay_later' && <Check className="h-4 w-4 text-primary-600" />}
                  </div>
                </button>
              </div>
            )}

            {/* GCash Payment Details */}
            {formData.payment_method === 'pay_now' && (
              <>
                {/* Section 2: Send Payment - Collapsible */}
                <div 
                  onClick={() => setSendPaymentExpanded(!sendPaymentExpanded)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                    !sendPaymentExpanded 
                      ? 'bg-green-50 border border-green-200 hover:bg-green-100' 
                      : 'bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      !sendPaymentExpanded ? 'bg-green-500 text-white' : 'bg-primary-600 text-white'
                    }`}>
                      {!sendPaymentExpanded ? <Check className="h-3 w-3" /> : '2'}
                    </div>
                    <span className="text-sm font-semibold text-neutral-900 uppercase tracking-wide">Send Payment To</span>
                    {!sendPaymentExpanded && (
                      <span className="text-xs text-green-600 font-medium ml-2">
                        (₱{getTotalAmount().toLocaleString()})
                      </span>
                    )}
                  </div>
                  <ChevronRight className={`h-4 w-4 text-neutral-500 transition-transform ${sendPaymentExpanded ? 'rotate-90' : ''}`} />
                </div>

                {sendPaymentExpanded && (
                  <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-xl p-4 border border-neutral-700">
                    <div className="flex items-center gap-2 text-primary-400 mb-3">
                      <Smartphone className="h-4 w-4" />
                      <span className="text-sm font-medium">GCASH Account Details</span>
                    </div>

                    {/* Two Column Layout: Details Left, QR Right */}
                    <div className="flex gap-4">
                      {/* Left: Account Details */}
                      <div className="flex-1 space-y-3">
                        <div>
                          <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Mobile Number</p>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-white tracking-wider">{GCASH_DETAILS.number}</span>
                            <button
                              onClick={() => copyToClipboard(GCASH_DETAILS.number)}
                              className="p-1.5 rounded-md bg-neutral-700 hover:bg-neutral-600 transition-colors"
                              title="Copy number"
                            >
                              {copiedNumber ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3 text-neutral-400" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Account Name</p>
                          <p className="text-base font-semibold text-white">{GCASH_DETAILS.name}</p>
                        </div>
                        <div className="pt-2 border-t border-neutral-700">
                          <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Amount to Send</p>
                          <p className="text-xl font-bold text-primary-400">₱{getTotalAmount().toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Right: QR Code (Bigger) */}
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-[10px] text-neutral-400 mb-1.5 uppercase tracking-wider">Scan QR</p>
                        <div className="p-2 bg-white rounded-lg shadow-lg">
                          <img
                            src={GCASH_DETAILS.qrCode}
                            alt="GCash QR Code"
                            className="w-40 h-40"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Info tip */}
                    <div className="mt-3 flex items-start gap-2 p-2.5 bg-neutral-800 rounded-lg border border-neutral-700">
                      <Info className="h-3.5 w-3.5 text-primary-400 flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-neutral-300">
                        Open your GCASH app, go to Send Money, enter the number above, and complete the transfer.
                      </p>
                    </div>

                    <button
                      onClick={() => { setSendPaymentExpanded(false); setUploadExpanded(true); }}
                      className="mt-3 w-full py-2 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      I've sent the payment →
                    </button>
                  </div>
                )}

                {/* Section 3: Upload Screenshot - Collapsible */}
                <div 
                  onClick={() => setUploadExpanded(!uploadExpanded)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                    formData.receipt_preview && !uploadExpanded 
                      ? 'bg-green-50 border border-green-200 hover:bg-green-100' 
                      : 'bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      formData.receipt_preview ? 'bg-green-500 text-white' : 'bg-primary-600 text-white'
                    }`}>
                      {formData.receipt_preview ? <Check className="h-3 w-3" /> : '3'}
                    </div>
                    <span className="text-sm font-semibold text-neutral-900 uppercase tracking-wide">Upload Payment Screenshot</span>
                    {formData.receipt_preview && !uploadExpanded && (
                      <span className="text-xs text-green-600 font-medium ml-2">(Uploaded ✓)</span>
                    )}
                  </div>
                  <ChevronRight className={`h-4 w-4 text-neutral-500 transition-transform ${uploadExpanded ? 'rotate-90' : ''}`} />
                </div>

                {uploadExpanded && (
                  <>
                    <p className="text-xs text-neutral-500 px-1">Take a screenshot of your payment confirmation and upload it here for verification.</p>

                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                        formData.receipt_preview 
                          ? 'border-green-300 bg-green-50' 
                          : 'border-neutral-300 bg-neutral-50 hover:border-primary-400 hover:bg-primary-50'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      {formData.receipt_preview ? (
                        <div>
                          <img
                            src={formData.receipt_preview}
                            alt="Receipt"
                            className="max-h-28 mx-auto rounded-lg mb-2 border border-neutral-200"
                          />
                          <p className="text-sm text-green-600 font-medium mb-2">Receipt uploaded!</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                            className="border-primary-600 text-primary-600"
                          >
                            Change Image
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-2">
                            <Upload className="h-5 w-5 text-primary-600" />
                          </div>
                          <p className="text-sm font-medium text-neutral-700 mb-1">Click to upload screenshot</p>
                          <p className="text-xs text-neutral-500">JPEG, PNG, GIF, or WebP (max 5MB)</p>
                        </>
                      )}
                    </div>
                  </>
                )}

                {/* Ready to Submit Indicator */}
                {formData.payment_receipt && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-green-700">All set! Click "Submit Booking" below.</span>
                  </div>
                )}
              </>
            )}

            {/* Pay Later Details */}
            {formData.payment_method === 'pay_later' && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-1">Payment on Pickup</h4>
                    <p className="text-sm text-amber-800">
                      Full payment of <span className="font-bold">₱{getTotalAmount().toLocaleString()}</span> is required upon 
                      turnover/delivery of the unit. Cash or GCash accepted.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="" size="md">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold text-neutral-900 uppercase tracking-wide">
            Book Your Ride
          </h2>
          
          {/* Step Indicators */}
          <div className="flex items-center justify-between mt-4 mb-2 overflow-x-auto">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              // If vehicle was pre-selected, mark step 1 as completed
              const isPreSelected = step.id === 1 && selectedVehicle && currentStep >= 2;
              return (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all text-xs ${
                        isCompleted || isPreSelected
                          ? 'bg-green-500 text-white'
                          : isActive
                          ? 'bg-primary-600 text-white'
                          : 'bg-neutral-200 text-neutral-500'
                      }`}
                    >
                      {isCompleted || isPreSelected ? <Check className="h-3 w-3 sm:h-4 sm:w-4" /> : <Icon className="h-3 w-3 sm:h-4 sm:w-4" />}
                    </div>
                    <span className={`text-[10px] sm:text-xs mt-1 hidden sm:block whitespace-nowrap ${isActive ? 'text-primary-600 font-medium' : 'text-neutral-400'}`}>
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`w-4 sm:w-8 lg:w-12 h-0.5 mx-0.5 sm:mx-1 ${currentStep > step.id || isPreSelected ? 'bg-green-500' : 'bg-neutral-200'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary-600 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="min-h-[300px]">{renderStepContent()}</div>

        {/* Navigation */}
        <div className="flex gap-3 pt-4 border-t border-neutral-200">
          {currentStep > 1 && !(currentStep === 2 && selectedVehicle) && (
            <Button type="button" variant="outline" onClick={handleBack} disabled={isLoading} className="flex-1">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          )}
          {currentStep < STEPS.length ? (
            <Button
              type="button"
              onClick={handleNext}
              className="flex-1 bg-primary-600 hover:bg-primary-700"
              disabled={!validateStep(currentStep)}
            >
              Continue <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isLoading || !validateStep(5)}
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</>
              ) : (
                <><CheckCircle className="h-4 w-4 mr-2" /> Submit Booking</>
              )}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default BookNowModal;
