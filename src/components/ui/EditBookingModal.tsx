import { type FC, useState, useEffect } from 'react';
import {
  Calendar,
  User,
  Car,
  MapPin,
  DollarSign,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Check,
} from 'lucide-react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { supabase } from '@services/supabase';

// Flexible booking input type that accepts various shapes
interface BookingInput {
  id: string;
  booking_number?: string;
  user_id?: string | null;
  vehicle_id?: string;
  pickup_date?: string;
  return_date?: string;
  pickup_location?: string;
  return_location?: string;
  total_days?: number;
  base_price?: number;
  extras_price?: number;
  discount_amount?: number;
  total_price?: number;
  total_amount?: number;
  deposit_paid?: number;
  status?: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  // Guest booking fields
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  drive_option?: string | null;
}

interface EditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  booking: BookingInput | null;
}

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
}

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  price_per_day: number;
  status: string;
}

interface BookingFormData {
  user_id: string;
  vehicle_id: string;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  return_location: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  deposit_paid: number;
  discount_amount: number;
  extras_price: number;
}

const STEPS = [
  { id: 1, title: 'Customer', icon: User },
  { id: 2, title: 'Vehicle', icon: Car },
  { id: 3, title: 'Rental Period', icon: Calendar },
  { id: 4, title: 'Payment', icon: DollarSign },
];

/**
 * Edit Booking Modal with Step-by-Step Wizard
 */
export const EditBookingModal: FC<EditBookingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  booking,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>({
    user_id: '',
    vehicle_id: '',
    pickup_date: '',
    return_date: '',
    pickup_location: 'Cebu City',
    return_location: 'Cebu City',
    status: 'confirmed',
    deposit_paid: 0,
    discount_amount: 0,
    extras_price: 0,
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load booking data when modal opens
  useEffect(() => {
    if (booking && isOpen) {
      setFormData({
        user_id: booking.user_id || '',
        vehicle_id: booking.vehicle_id || '',
        pickup_date: booking.pickup_date || '',
        return_date: booking.return_date || '',
        pickup_location: booking.pickup_location || 'Cebu City',
        return_location: booking.return_location || 'Cebu City',
        status: booking.status || 'confirmed',
        deposit_paid: booking.deposit_paid || 0,
        discount_amount: booking.discount_amount || 0,
        extras_price: booking.extras_price || 0,
      });
    }
  }, [booking, isOpen]);

  // Fetch customers and vehicles
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        // Fetch customers
        const { data: customersData } = await supabase
          .from('users')
          .select('id, full_name, email, phone_number')
          .eq('role', 'customer')
          .order('full_name');

        // Fetch all vehicles (not just available ones for editing)
        const { data: vehiclesData } = await supabase
          .from('vehicles')
          .select('id, brand, model, price_per_day, status')
          .order('brand');

        setCustomers(customersData || []);
        setVehicles(vehiclesData || []);

        // Set selected vehicle and customer
        if (booking) {
          const vehicle = vehiclesData?.find((v) => v.id === booking.vehicle_id);
          const customer = customersData?.find((c) => c.id === booking.user_id);
          setSelectedVehicle(vehicle || null);
          setSelectedCustomer(customer || null);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoadingData(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, booking]);

  // Calculate pricing
  const calculatePricing = () => {
    if (!selectedVehicle || !formData.pickup_date || !formData.return_date) {
      return { days: 0, basePrice: 0, total: 0 };
    }

    const pickup = new Date(formData.pickup_date);
    const returnDate = new Date(formData.return_date);
    const days = Math.max(1, Math.ceil((returnDate.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24)));
    const basePrice = days * selectedVehicle.price_per_day;
    const total = basePrice + formData.extras_price - formData.discount_amount;

    return { days, basePrice, total: Math.max(0, total) };
  };

  const pricing = calculatePricing();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));

    if (name === 'vehicle_id') {
      const vehicle = vehicles.find((v) => v.id === value);
      setSelectedVehicle(vehicle || null);
    }

    if (name === 'user_id') {
      const customer = customers.find((c) => c.id === value);
      setSelectedCustomer(customer || null);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.user_id;
      case 2:
        return !!formData.vehicle_id;
      case 3:
        return !!(formData.pickup_date && formData.return_date);
      case 4:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
      setError(null);
    } else {
      const messages: Record<number, string> = {
        1: 'Please select a customer',
        2: 'Please select a vehicle',
        3: 'Please select pickup and return dates',
      };
      setError(messages[currentStep] || 'Please fill in required fields');
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!booking) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check if status is changing from pending to confirmed
      const isBeingConfirmed = booking.status === 'pending' && formData.status === 'confirmed';

      const updateData = {
        user_id: formData.user_id,
        vehicle_id: formData.vehicle_id,
        pickup_date: formData.pickup_date,
        return_date: formData.return_date,
        pickup_location: formData.pickup_location,
        return_location: formData.return_location,
        total_days: pricing.days,
        base_price: pricing.basePrice,
        extras_price: formData.extras_price,
        discount_amount: formData.discount_amount,
        total_price: pricing.total,
        deposit_paid: formData.deposit_paid,
        status: formData.status,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', booking.id);

      if (updateError) {
        throw updateError;
      }

      // Send confirmation email if booking was just confirmed
      if (isBeingConfirmed && booking.customer_email) {
        console.log('📧 Booking confirmed! Sending confirmation email...');
        
        // Import email service dynamically
        const { sendMagicLinkEmail } = await import('../../services/emailService');
        const { getMagicLinkFromBooking } = await import('../../services/bookingSecurityService');
        
        try {
          const magicLink = getMagicLinkFromBooking(booking.booking_number);
          const vehicle = vehicles.find(v => v.id === formData.vehicle_id);
          const vehicleName = vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Unknown Vehicle';
          const pickupDate = formData.pickup_date 
            ? new Date(formData.pickup_date).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })
            : undefined;
          const returnDate = formData.return_date
            ? new Date(formData.return_date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric', 
                year: 'numeric'
              })
            : undefined;
          
          await sendMagicLinkEmail(
            booking.customer_email,
            booking.booking_number,
            magicLink,
            {
              vehicleName,
              pickupDate,
              returnDate
            }, 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              }),
              returnDate: new Date(formData.return_date).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })
            },
            'confirmed' // Send confirmed email
          );
          
          console.log('✅ Confirmation email sent successfully!');
        } catch (emailError) {
          console.warn('⚠️ Failed to send confirmation email:', emailError);
          // Don't fail the booking update if email fails
        }
      }

      setCurrentStep(1);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Error updating booking:', err);
      setError(err.message || 'Failed to update booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setError(null);
    onClose();
  };

  const progress = (currentStep / STEPS.length) * 100;

  const renderStepContent = () => {
    if (isLoadingData) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          <span className="ml-3 text-neutral-600">Loading data...</span>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <p className="text-neutral-500 text-sm mb-6">
              Select the customer for this booking.
            </p>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Customer *
              </label>
              <select
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.full_name} - {customer.email}
                  </option>
                ))}
              </select>
            </div>
            {selectedCustomer && (
              <div className="p-4 bg-neutral-50 rounded-lg">
                <h4 className="font-medium text-neutral-900 mb-2">Selected Customer</h4>
                <p className="text-sm text-neutral-600">{selectedCustomer.full_name}</p>
                <p className="text-sm text-neutral-500">{selectedCustomer.email}</p>
                {selectedCustomer.phone_number && (
                  <p className="text-sm text-neutral-500">{selectedCustomer.phone_number}</p>
                )}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <p className="text-neutral-500 text-sm mb-6">
              Select the vehicle for this booking.
            </p>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Vehicle *
              </label>
              <select
                name="vehicle_id"
                value={formData.vehicle_id}
                onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">Select a vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model} - ₱{vehicle.price_per_day.toLocaleString()}/day
                  </option>
                ))}
              </select>
            </div>
            {selectedVehicle && (
              <div className="p-4 bg-neutral-50 rounded-lg">
                <h4 className="font-medium text-neutral-900 mb-2">Selected Vehicle</h4>
                <p className="text-sm text-neutral-600">{selectedVehicle.brand} {selectedVehicle.model}</p>
                <p className="text-sm text-primary-600 font-medium">₱{selectedVehicle.price_per_day.toLocaleString()}/day</p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <p className="text-neutral-500 text-sm mb-6">
              Set the rental period and locations.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Pickup Date *"
                name="pickup_date"
                type="date"
                value={formData.pickup_date}
                onChange={handleChange}
              />
              <Input
                label="Return Date *"
                name="return_date"
                type="date"
                value={formData.return_date}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Pickup Location"
                name="pickup_location"
                value={formData.pickup_location}
                onChange={handleChange}
                leftIcon={<MapPin className="h-4 w-4" />}
              />
              <Input
                label="Return Location"
                name="return_location"
                value={formData.return_location}
                onChange={handleChange}
                leftIcon={<MapPin className="h-4 w-4" />}
              />
            </div>
            {pricing.days > 0 && (
              <div className="p-4 bg-primary-50 rounded-lg">
                <p className="text-sm text-primary-700">
                  Rental Duration: <span className="font-semibold">{pricing.days} day{pricing.days > 1 ? 's' : ''}</span>
                </p>
                <p className="text-sm text-primary-700">
                  Base Price: <span className="font-semibold">₱{pricing.basePrice.toLocaleString()}</span>
                </p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <p className="text-neutral-500 text-sm mb-6">
              Update payment details and booking status.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Booking Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Deposit Paid"
                name="deposit_paid"
                type="number"
                value={formData.deposit_paid}
                onChange={handleChange}
              />
              <Input
                label="Discount"
                name="discount_amount"
                type="number"
                value={formData.discount_amount}
                onChange={handleChange}
              />
              <Input
                label="Extras"
                name="extras_price"
                type="number"
                value={formData.extras_price}
                onChange={handleChange}
              />
            </div>
            {/* Pricing Summary */}
            <div className="p-4 bg-neutral-100 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Base Price ({pricing.days} days)</span>
                <span>₱{pricing.basePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Extras</span>
                <span>+ ₱{formData.extras_price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Discount</span>
                <span>- ₱{formData.discount_amount.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary-600">₱{pricing.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="p-6">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-full transition-all
                      ${isCompleted ? 'bg-green-500 text-white' : ''}
                      ${isActive ? 'bg-primary-600 text-white' : ''}
                      ${!isActive && !isCompleted ? 'bg-neutral-200 text-neutral-500' : ''}
                    `}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`w-12 h-1 mx-2 rounded ${
                        currentStep > step.id ? 'bg-green-500' : 'bg-neutral-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-neutral-900">
              {STEPS[currentStep - 1].title}
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              Step {currentStep} of {STEPS.length}
            </p>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="min-h-[300px]">{renderStepContent()}</div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          
          {currentStep < STEPS.length ? (
            <Button onClick={handleNext} disabled={isLoadingData}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                'Update Booking'
              )}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default EditBookingModal;
