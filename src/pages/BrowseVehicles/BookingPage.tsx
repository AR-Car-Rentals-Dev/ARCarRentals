import { type FC, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Check, ChevronRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import type { Car } from '@/types';
import { updateRenterInfo, updateSearchCriteria, updateDriveOption, agreeToTerms } from '@/utils/sessionManager';

interface BookingState {
  vehicle: Car;
}

type DriveOption = 'self-drive' | 'with-driver' | '';

// Driver cost
const DRIVER_COST = {
  base: 1000, // 12 hours
  baseHours: 12,
};

// Taxes and fees
const TAXES_AND_FEES = 500;

/**
 * Booking Page - Step 2: Enter Details
 */
export const BookingPage: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as BookingState | null;

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+63 ');
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [pickupTime, setPickupTime] = useState('10:00');
  const [driveOption, setDriveOption] = useState<DriveOption>('');
  const [formErrors, setFormErrors] = useState({
    fullName: false,
    email: false,
    phoneNumber: false,
    pickupLocation: false,
    pickupDate: false,
    returnDate: false,
    driveOption: false,
  });

  // Redirect if no vehicle data
  useEffect(() => {
    if (!state?.vehicle) {
      navigate('/browsevehicles');
    }
  }, [state, navigate]);

  if (!state?.vehicle) {
    return null;
  }

  const { vehicle } = state;

  // Calculate rental duration
  const calculateDays = () => {
    if (!pickupDate || !returnDate) return 1;
    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const rentalDays = calculateDays();

  // Calculate costs
  const carBasePrice = vehicle.pricePerDay * rentalDays;
  const driverCost = driveOption === 'with-driver' ? DRIVER_COST.base * rentalDays : 0;
  const totalPrice = carBasePrice + driverCost + TAXES_AND_FEES;

  // Format date for input display (Oct 24, 2024)
  const formatDateForSummary = (dateString: string) => {
    if (!dateString) return 'Not selected';
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  // Format time for display
  const formatTime = (time: string) => {
    if (!time) return '10:00 AM';
    
    // If time already contains AM/PM, return as-is
    if (time.includes('AM') || time.includes('PM')) {
      return time;
    }
    
    // Otherwise, format from 24-hour format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Handle form submission
  const handleProceedToPayment = async () => {
    // Validate required fields
    const errors = {
      fullName: !fullName.trim(),
      email: !email.trim(),
      phoneNumber: !phoneNumber.trim() || phoneNumber.trim() === '+63',
      pickupLocation: !pickupLocation.trim(),
      pickupDate: !pickupDate,
      returnDate: !returnDate,
      driveOption: !driveOption,
    };

    // Check if any field has errors
    if (Object.values(errors).some(error => error)) {
      setFormErrors(errors);
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Clear errors if all valid
    setFormErrors({
      fullName: false,
      email: false,
      phoneNumber: false,
      pickupLocation: false,
      pickupDate: false,
      returnDate: false,
      driveOption: false,
    });

    // Save renter info and drive option to session
    await updateRenterInfo({
      fullName,
      email,
      phoneNumber,
      driversLicense: '', // Not collected anymore - verified at pickup
    });
    
    // Save search criteria
    await updateSearchCriteria({
      pickupLocation,
      pickupDate,
      returnDate,
      startTime: pickupTime,
      deliveryMethod: 'pickup'
    });
    
    await updateDriveOption(driveOption as 'self-drive' | 'with-driver');
    
    // Mark terms as agreed and update step to checkout
    await agreeToTerms();
    
    // Generate booking ID
    const bookingId = `AR-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Navigate to checkout with all booking data
    navigate('/browsevehicles/checkout', {
      state: {
        vehicle,
        searchCriteria: {
          location: pickupLocation,
          pickupDate,
          returnDate,
          startTime: pickupTime,
          deliveryMethod: 'pickup',
        },
        renterInfo: {
          fullName,
          email,
          phoneNumber,
          driversLicense: '', // Not collected - verified at pickup
        },
        driveOption,
        pricing: {
          carBasePrice,
          driverCost,
          taxesAndFees: TAXES_AND_FEES,
          totalPrice,
          rentalDays,
        },
        bookingId,
      },
    });
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Progress Steps */}
      <div className="border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-4">
            {/* Step 1 - Complete */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#22C55E] flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-[#22C55E]">Select Car</span>
            </div>

            {/* Connector */}
            <div className="w-24 h-0.5 bg-[#22C55E]" />

            {/* Step 2 - Active */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#E22B2B] flex items-center justify-center">
                <span className="text-white font-semibold text-sm">2</span>
              </div>
              <span className="text-sm font-medium text-[#E22B2B]">Enter Details</span>
            </div>

            {/* Connector */}
            <div className="w-24 h-0.5 bg-neutral-200" />

            {/* Step 3 - Pending */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
                <span className="text-neutral-500 font-semibold text-sm">3</span>
              </div>
              <span className="text-sm font-medium text-neutral-400">Payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Form */}
          <div className="flex-1 space-y-8">
            {/* Renter Information */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                  <User className="w-4 h-4 text-[#E22B2B]" />
                </div>
                <h2 className="text-lg font-semibold text-neutral-900">Renter Information</h2>
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (e.target.value.trim()) setFormErrors(prev => ({ ...prev, fullName: false }));
                    }}
                    placeholder="e.g. Juan dela Cruz"
                    className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E22B2B]/20 focus:border-[#E22B2B] ${
                      formErrors.fullName ? 'border-[#E22B2B] ring-2 ring-[#E22B2B]/20' : 'border-neutral-200'
                    }`}
                  />
                  {formErrors.fullName && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-[#E22B2B]">
                      <AlertCircle className="h-3 w-3" />
                      <span>Please enter your full name</span>
                    </div>
                  )}
                </div>

                {/* Email & Phone - Side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (e.target.value.trim()) setFormErrors(prev => ({ ...prev, email: false }));
                      }}
                      placeholder="juan@example.com"
                      className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E22B2B]/20 focus:border-[#E22B2B] ${
                        formErrors.email ? 'border-[#E22B2B] ring-2 ring-[#E22B2B]/20' : 'border-neutral-200'
                      }`}
                    />
                    {formErrors.email && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-[#E22B2B]">
                        <AlertCircle className="h-3 w-3" />
                        <span>Please enter your email address</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        if (e.target.value.trim() && e.target.value.trim() !== '+63') {
                          setFormErrors(prev => ({ ...prev, phoneNumber: false }));
                        }
                      }}
                      placeholder="+63 917 123 4567"
                      className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E22B2B]/20 focus:border-[#E22B2B] ${
                        formErrors.phoneNumber ? 'border-[#E22B2B] ring-2 ring-[#E22B2B]/20' : 'border-neutral-200'
                      }`}
                    />
                    {formErrors.phoneNumber && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-[#E22B2B]">
                        <AlertCircle className="h-3 w-3" />
                        <span>Please enter your phone number</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pickup Location, Pickup Date, Return Date */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Pickup Location
                  </label>
                  <input
                    type="text"
                    value={pickupLocation}
                    onChange={(e) => {
                      setPickupLocation(e.target.value);
                      if (e.target.value.trim()) setFormErrors(prev => ({ ...prev, pickupLocation: false }));
                    }}
                    placeholder="e.g. Mactan-Cebu Airport, SM Seaside, Hotel Address"
                    className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E22B2B]/20 focus:border-[#E22B2B] ${
                      formErrors.pickupLocation ? 'border-[#E22B2B] ring-2 ring-[#E22B2B]/20' : 'border-neutral-200'
                    }`}
                  />
                  {formErrors.pickupLocation && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-[#E22B2B]">
                      <AlertCircle className="h-3 w-3" />
                      <span>Please enter pickup location</span>
                    </div>
                  )}
                </div>

                {/* Pickup and Return Dates - Side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Pickup Date
                    </label>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => {
                        setPickupDate(e.target.value);
                        if (e.target.value) setFormErrors(prev => ({ ...prev, pickupDate: false }));
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E22B2B]/20 focus:border-[#E22B2B] ${
                        formErrors.pickupDate ? 'border-[#E22B2B] ring-2 ring-[#E22B2B]/20' : 'border-neutral-200'
                      }`}
                    />
                    {formErrors.pickupDate && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-[#E22B2B]">
                        <AlertCircle className="h-3 w-3" />
                        <span>Please select pickup date</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Return Date
                    </label>
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => {
                        setReturnDate(e.target.value);
                        if (e.target.value) setFormErrors(prev => ({ ...prev, returnDate: false }));
                      }}
                      min={pickupDate || new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E22B2B]/20 focus:border-[#E22B2B] ${
                        formErrors.returnDate ? 'border-[#E22B2B] ring-2 ring-[#E22B2B]/20' : 'border-neutral-200'
                      }`}
                    />
                    {formErrors.returnDate && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-[#E22B2B]">
                        <AlertCircle className="h-3 w-3" />
                        <span>Please select return date</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pickup Time */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Pickup Time
                  </label>
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E22B2B]/20 focus:border-[#E22B2B]"
                  />
                  <p className="mt-1.5 text-xs text-neutral-400">
                    Office hours: Mon-Sat, 10:00 AM - 5:30 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Drive Option Selection */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <path strokeWidth="2" d="M12 8v4l3 3" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-neutral-900">Drive Option</h2>
              </div>

              {formErrors.driveOption && (
                <div className="flex items-center gap-2 mb-4 p-3 bg-red-50 border border-[#E22B2B] rounded-lg text-sm text-[#E22B2B]">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>Please select a drive option</span>
                </div>
              )}

              <div className="space-y-3">
                {/* Self-drive Option */}
                <label
                  className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                    driveOption === 'self-drive'
                      ? 'border-[#E22B2B] bg-red-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="driveOption"
                    value="self-drive"
                    checked={driveOption === 'self-drive'}
                    onChange={(e) => {
                      setDriveOption(e.target.value as DriveOption);
                      setFormErrors(prev => ({ ...prev, driveOption: false }));
                    }}
                    className="w-5 h-5 text-[#E22B2B] border-neutral-300 focus:ring-[#E22B2B]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-neutral-900">Self-drive</span>
                      <span className="text-sm text-neutral-500">Included</span>
                    </div>
                    <p className="text-sm text-neutral-500 mt-0.5">Drive the vehicle yourself</p>
                  </div>
                </label>

                {/* With Driver Option */}
                <label
                  className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                    driveOption === 'with-driver'
                      ? 'border-[#E22B2B] bg-red-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="driveOption"
                    value="with-driver"
                    checked={driveOption === 'with-driver'}
                    onChange={(e) => {
                      setDriveOption(e.target.value as DriveOption);
                      setFormErrors(prev => ({ ...prev, driveOption: false }));
                    }}
                    className="w-5 h-5 text-[#E22B2B] border-neutral-300 focus:ring-[#E22B2B]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-neutral-900">With driver</span>
                      <span className="text-sm font-medium text-[#E22B2B]">₱{DRIVER_COST.base.toLocaleString()}<span className="text-neutral-400 font-normal">/day</span></span>
                    </div>
                    <p className="text-sm text-neutral-500 mt-0.5">Professional driver included ({DRIVER_COST.baseHours} hours)</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:w-[380px]">
            <div className="bg-white rounded-xl border border-neutral-200 p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Booking Summary</h2>

              {/* Vehicle Info */}
              <div className="flex gap-4 mb-6">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-24 h-16 object-cover rounded-lg bg-neutral-100"
                />
                <div>
                  <h3 className="font-semibold text-neutral-900">{vehicle.name}</h3>
                  <p className="text-sm text-neutral-500 capitalize">{vehicle.category} · {vehicle.transmission}</p>
                  <span className="inline-flex items-center gap-1 mt-1 text-xs text-green-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Available
                  </span>
                </div>
              </div>

              {/* Pickup & Dropoff Details */}
              <div className="space-y-4 mb-6">
                {/* Pickup */}
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#E22B2B] mt-1.5" />
                  <div>
                    <p className="text-xs text-neutral-400 uppercase tracking-wide">PICK-UP</p>
                    <p className="font-medium text-neutral-900">{pickupLocation || 'Not selected yet'}</p>
                    <p className="text-sm text-neutral-500">
                      {pickupDate ? formatDateForSummary(pickupDate) : 'Select date'} at {formatTime(pickupTime)}
                    </p>
                  </div>
                </div>

                {/* Dropoff */}
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-neutral-400 mt-1.5" />
                  <div>
                    <p className="text-xs text-neutral-400 uppercase tracking-wide">DROP-OFF</p>
                    <p className="font-medium text-neutral-900">{pickupLocation || 'Not selected yet'}</p>
                    <p className="text-sm text-neutral-500">
                      {returnDate ? formatDateForSummary(returnDate) : 'Select date'} at {formatTime(pickupTime)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div className="bg-neutral-50 rounded-lg px-4 py-3 mb-6">
                <p className="text-sm text-neutral-600 text-center">
                  Total Rental Duration: <span className="font-semibold text-neutral-900">{rentalDays} Day{rentalDays > 1 ? 's' : ''}</span>
                </p>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Car Base Price ({rentalDays} day{rentalDays > 1 ? 's' : ''})</span>
                  <span className="font-medium text-neutral-900">₱{carBasePrice.toLocaleString()}</span>
                </div>
                {driveOption === 'with-driver' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Driver ({rentalDays} day{rentalDays > 1 ? 's' : ''})</span>
                    <span className="font-medium text-neutral-900">₱{driverCost.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Basic Insurance</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Taxes & Fees</span>
                  <span className="font-medium text-neutral-900">₱{TAXES_AND_FEES.toLocaleString()}</span>
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-neutral-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-neutral-900">Total</span>
                  <span className="text-2xl font-bold text-[#E22B2B]">₱{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Free Cancellation Notice */}
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg mb-6">
                <AlertCircle className="w-5 h-5 text-[#E22B2B] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">Free Cancellation</p>
                  <p className="text-xs text-neutral-500">Cancel for free up to 24 hours before pick-up.</p>
                </div>
              </div>

              {/* Proceed Button */}
              <Button
                variant="primary"
                fullWidth
                onClick={handleProceedToPayment}
                className="bg-[#E22B2B] hover:bg-[#c92525] border-none rounded-full py-3.5 text-base font-medium"
              >
                Proceed to Payment
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
