import { type FC, useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, Check, ChevronRight, AlertCircle, ArrowLeft, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui';
import type { Car } from '@/types';
import { updateRenterInfo, updateSearchCriteria, updateDriveOption, agreeToTerms } from '@/utils/sessionManager';
import { CarRentalAgreementModal } from './CarRentalAgreementModal';
import { debouncedSaveLead, cancelPendingSave, type LeadData } from '@/services/leadsService';

interface BookingState {
  vehicle: Car;
  // Prefilled data when navigating back from checkout
  prefilled?: {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    pickupLocation?: string;
    dropoffLocation?: string;
    pickupDate?: string;
    returnDate?: string;
    pickupTime?: string;
    driveOption?: 'self-drive' | 'with-driver';
  };
}

type DriveOption = 'self-drive' | 'with-driver' | '';

// Driver cost
const DRIVER_COST = {
  base: 1000, // per 12 hours
  baseHours: 12,
  exceedingHourRate: 150, // per hour after 12 hours (not added to total, just for info)
};

// Pickup/Drop-off locations with additional costs
const LOCATION_OPTIONS = [
  { name: 'AR Car Rentals Office', cost: 0 },
  { name: 'Lapu-Lapu City', cost: 300 },
  { name: 'Mandaue City', cost: 350 },
  { name: 'Cebu City', cost: 450 },
  { name: 'Talisay City', cost: 500 },
];

// Country codes with abbreviation and max phone number length
const COUNTRY_CODES = [
  { code: '+63', country: 'PH', name: 'Philippines', maxLength: 10 },
  { code: '+1', country: 'US', name: 'United States', maxLength: 10 },
  { code: '+1', country: 'CA', name: 'Canada', maxLength: 10 },
  { code: '+44', country: 'GB', name: 'United Kingdom', maxLength: 10 },
  { code: '+61', country: 'AU', name: 'Australia', maxLength: 9 },
  { code: '+81', country: 'JP', name: 'Japan', maxLength: 10 },
  { code: '+82', country: 'KR', name: 'South Korea', maxLength: 10 },
  { code: '+86', country: 'CN', name: 'China', maxLength: 11 },
  { code: '+91', country: 'IN', name: 'India', maxLength: 10 },
  { code: '+65', country: 'SG', name: 'Singapore', maxLength: 8 },
  { code: '+60', country: 'MY', name: 'Malaysia', maxLength: 10 },
  { code: '+66', country: 'TH', name: 'Thailand', maxLength: 9 },
  { code: '+84', country: 'VN', name: 'Vietnam', maxLength: 10 },
  { code: '+62', country: 'ID', name: 'Indonesia', maxLength: 11 },
  { code: '+971', country: 'AE', name: 'UAE', maxLength: 9 },
  { code: '+966', country: 'SA', name: 'Saudi Arabia', maxLength: 9 },
  { code: '+49', country: 'DE', name: 'Germany', maxLength: 11 },
  { code: '+33', country: 'FR', name: 'France', maxLength: 9 },
  { code: '+39', country: 'IT', name: 'Italy', maxLength: 10 },
  { code: '+34', country: 'ES', name: 'Spain', maxLength: 9 },
  { code: '+31', country: 'NL', name: 'Netherlands', maxLength: 9 },
  { code: '+46', country: 'SE', name: 'Sweden', maxLength: 9 },
  { code: '+47', country: 'NO', name: 'Norway', maxLength: 8 },
  { code: '+45', country: 'DK', name: 'Denmark', maxLength: 8 },
  { code: '+358', country: 'FI', name: 'Finland', maxLength: 10 },
  { code: '+64', country: 'NZ', name: 'New Zealand', maxLength: 9 },
  { code: '+55', country: 'BR', name: 'Brazil', maxLength: 11 },
  { code: '+52', country: 'MX', name: 'Mexico', maxLength: 10 },
  { code: '+54', country: 'AR', name: 'Argentina', maxLength: 10 },
  { code: '+57', country: 'CO', name: 'Colombia', maxLength: 10 },
  { code: '+56', country: 'CL', name: 'Chile', maxLength: 9 },
  { code: '+20', country: 'EG', name: 'Egypt', maxLength: 10 },
  { code: '+27', country: 'ZA', name: 'South Africa', maxLength: 9 },
  { code: '+234', country: 'NG', name: 'Nigeria', maxLength: 10 },
  { code: '+254', country: 'KE', name: 'Kenya', maxLength: 9 },
  { code: '+7', country: 'RU', name: 'Russia', maxLength: 10 },
  { code: '+380', country: 'UA', name: 'Ukraine', maxLength: 9 },
  { code: '+48', country: 'PL', name: 'Poland', maxLength: 9 },
  { code: '+90', country: 'TR', name: 'Turkey', maxLength: 10 },
  { code: '+972', country: 'IL', name: 'Israel', maxLength: 9 },
  { code: '+852', country: 'HK', name: 'Hong Kong', maxLength: 8 },
  { code: '+886', country: 'TW', name: 'Taiwan', maxLength: 9 },
  { code: '+853', country: 'MO', name: 'Macau', maxLength: 8 },
  { code: '+673', country: 'BN', name: 'Brunei', maxLength: 7 },
  { code: '+95', country: 'MM', name: 'Myanmar', maxLength: 9 },
  { code: '+855', country: 'KH', name: 'Cambodia', maxLength: 9 },
  { code: '+856', country: 'LA', name: 'Laos', maxLength: 10 },
  { code: '+880', country: 'BD', name: 'Bangladesh', maxLength: 10 },
  { code: '+92', country: 'PK', name: 'Pakistan', maxLength: 10 },
  { code: '+94', country: 'LK', name: 'Sri Lanka', maxLength: 9 },
  { code: '+977', country: 'NP', name: 'Nepal', maxLength: 10 },
];

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
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState(COUNTRY_CODES[0]); // Default to Philippines
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [pickupTime, setPickupTime] = useState('10:00');
  const [driveOption, setDriveOption] = useState<DriveOption>('');
  const [formErrors, setFormErrors] = useState({
    fullName: false,
    email: false,
    phoneNumber: false,
    pickupLocation: false,
    dropoffLocation: false,
    pickupDate: false,
    returnDate: false,
    driveOption: false,
  });
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // Redirect if no vehicle data
  useEffect(() => {
    if (!state?.vehicle) {
      navigate('/browsevehicles');
    }
  }, [state, navigate]);

  // Initialize form fields from prefilled data (when navigating back from checkout)
  useEffect(() => {
    if (state?.prefilled) {
      const p = state.prefilled;
      if (p.fullName) setFullName(p.fullName);
      if (p.email) setEmail(p.email);
      if (p.phoneNumber) {
        // Extract phone number without country code
        const phoneWithCode = p.phoneNumber;
        // Find matching country code and extract the number
        const matchedCountry = COUNTRY_CODES.find(c => phoneWithCode.startsWith(c.code));
        if (matchedCountry) {
          setSelectedCountryCode(matchedCountry);
          setPhoneNumber(phoneWithCode.slice(matchedCountry.code.length));
        } else {
          setPhoneNumber(phoneWithCode);
        }
      }
      if (p.pickupLocation) setPickupLocation(p.pickupLocation);
      if (p.dropoffLocation) setDropoffLocation(p.dropoffLocation);
      if (p.pickupDate) setPickupDate(p.pickupDate);
      if (p.returnDate) setReturnDate(p.returnDate);
      if (p.pickupTime) setPickupTime(p.pickupTime);
      if (p.driveOption) setDriveOption(p.driveOption);
    }
  }, [state?.prefilled]);

  if (!state?.vehicle) {
    return null;
  }

  const { vehicle } = state;

  // Get location cost
  const getLocationCost = (locationName: string) => {
    const location = LOCATION_OPTIONS.find(loc => loc.name === locationName);
    return location?.cost || 0;
  };

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
  const pickupLocationCost = getLocationCost(pickupLocation);
  const dropoffLocationCost = getLocationCost(dropoffLocation);

  // Calculate costs - driver cost is flat 1000 (paid separately to driver)
  const carBasePrice = vehicle.pricePerDay * rentalDays;
  // Driver cost is NOT included in total - paid directly to driver
  const driverCost = driveOption === 'with-driver' ? DRIVER_COST.base : 0;
  // Car wash fee only applies for self-drive
  const carWashFee = driveOption === 'self-drive' && vehicle.carWashFee ? vehicle.carWashFee : 0;
  const totalLocationCost = pickupLocationCost + dropoffLocationCost;
  const totalPrice = carBasePrice + totalLocationCost + carWashFee; // Driver cost excluded from total, car wash fee included for self-drive

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

  // Email validation helper
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone number validation helper (based on selected country's max length)
  const isValidPhoneNumber = (phone: string) => {
    // Remove spaces and check if matches country's expected length
    const cleaned = phone.replace(/\s/g, '');
    const maxLength = selectedCountryCode.maxLength;
    return new RegExp(`^\\d{${maxLength}}$`).test(cleaned);
  };

  // Handle phone number input (based on selected country's max length)
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    // Strip leading zeros (since country code already handles the prefix)
    value = value.replace(/^0+/, '');
    const maxLength = selectedCountryCode.maxLength;
    if (value.length <= maxLength) {
      setPhoneNumber(value);
      if (value.length === maxLength) {
        setFormErrors(prev => ({ ...prev, phoneNumber: false }));
      }
    }
  };

  // Handle country code change
  const handleCountryCodeChange = (country: typeof COUNTRY_CODES[0]) => {
    setSelectedCountryCode(country);
    setShowCountryDropdown(false);
    // Reset phone number if it exceeds new max length
    if (phoneNumber.length > country.maxLength) {
      setPhoneNumber(phoneNumber.slice(0, country.maxLength));
    }
  };

  // Track if lead has been saved to avoid duplicate saves
  const leadSavedRef = useRef(false);

  // Check if form is complete (all required fields filled)
  const isFormComplete =
    fullName.trim() !== '' &&
    email.trim() !== '' &&
    isValidEmail(email.trim()) &&
    phoneNumber.trim() !== '' &&
    isValidPhoneNumber(phoneNumber) &&
    pickupLocation !== '' &&
    dropoffLocation !== '' &&
    pickupDate !== '' &&
    returnDate !== '' &&
    driveOption !== '';

  // Auto-save lead when contact info is filled
  useEffect(() => {
    // Only save if all contact fields are filled and valid
    if (
      fullName.trim() &&
      email.trim() &&
      isValidEmail(email.trim()) &&
      phoneNumber.trim() &&
      isValidPhoneNumber(phoneNumber)
    ) {
      console.log('📋 Contact info complete, saving lead...');

      const leadData: LeadData = {
        lead_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: `${selectedCountryCode.code}${phoneNumber}`,
        vehicle_id: vehicle.id,
        pickup_location: pickupLocation || undefined,
        dropoff_location: dropoffLocation || undefined,
        pickup_date: pickupDate || undefined,
        pickup_time: pickupTime || undefined,
        return_date: returnDate || undefined,
        rental_days: rentalDays,
        estimated_price: totalPrice,
        drive_option: driveOption || undefined,
        last_step: 'renter_info',
      };

      // Debounce the save to avoid too many database calls
      debouncedSaveLead(leadData, 2000);
      leadSavedRef.current = true;
    }

    // Cleanup: cancel pending save on unmount
    return () => {
      cancelPendingSave();
    };
  }, [fullName, email, phoneNumber, selectedCountryCode, pickupLocation, dropoffLocation, pickupDate, pickupTime, returnDate, driveOption, vehicle.id, rentalDays, totalPrice]);

  // Handle form submission - Show agreement first
  const handleProceedToPayment = async () => {
    // Validate required fields
    const errors = {
      fullName: !fullName.trim(),
      email: !email.trim() || !isValidEmail(email.trim()),
      phoneNumber: !phoneNumber.trim() || !isValidPhoneNumber(phoneNumber),
      pickupLocation: !pickupLocation,
      dropoffLocation: !dropoffLocation,
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
      dropoffLocation: false,
      pickupDate: false,
      returnDate: false,
      driveOption: false,
    });

    // Show rental agreement modal
    setShowAgreementModal(true);
  };

  // Handle agreement accepted - Proceed to checkout
  const handleAgreementAccepted = async () => {
    // Close modal
    setShowAgreementModal(false);

    // Save renter info and drive option to session
    await updateRenterInfo({
      fullName,
      email,
      phoneNumber: `${selectedCountryCode.code}${phoneNumber}`,
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
          dropoffLocation,
          pickupDate,
          returnDate,
          startTime: pickupTime,
          deliveryMethod: 'pickup',
        },
        renterInfo: {
          fullName,
          email,
          phoneNumber: `${selectedCountryCode.code}${phoneNumber}`,
          driversLicense: '', // Not collected - verified at pickup
        },
        driveOption,
        pricing: {
          carBasePrice,
          driverCost,
          carWashFee,
          pickupLocationCost,
          dropoffLocationCost,
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
        <div className="max-w-5xl mx-auto px-4 py-3">
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

      {/* Back Button */}
      <div className="mx-auto w-full max-w-[1200px] pt-4" style={{ paddingInline: 'clamp(0.75rem, 1.5vw, 1.5rem)' }}>
        <button
          onClick={() => navigate('/browsevehicles')}
          className="flex items-center gap-2 text-neutral-600 hover:text-[#E22B2B] transition-colors group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Vehicles</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="mx-auto w-full max-w-[1200px] py-6" style={{ paddingInline: 'clamp(0.75rem, 1.5vw, 1.5rem)' }}>
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
                    className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E22B2B]/20 focus:border-[#E22B2B] ${formErrors.fullName ? 'border-[#E22B2B] ring-2 ring-[#E22B2B]/20' : 'border-neutral-200'
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
                        if (e.target.value.trim() && isValidEmail(e.target.value.trim())) {
                          setFormErrors(prev => ({ ...prev, email: false }));
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value.trim() && !isValidEmail(e.target.value.trim())) {
                          setFormErrors(prev => ({ ...prev, email: true }));
                        }
                      }}
                      placeholder="juan@example.com"
                      className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E22B2B]/20 focus:border-[#E22B2B] ${formErrors.email ? 'border-[#E22B2B] ring-2 ring-[#E22B2B]/20' : 'border-neutral-200'
                        }`}
                    />
                    {formErrors.email && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-[#E22B2B]">
                        <AlertCircle className="h-3 w-3" />
                        <span>Please enter a valid email address</span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative flex">
                      {/* Country Code Dropdown */}
                      <div className="relative flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                          className="flex items-center gap-1.5 px-3 py-3 border border-r-0 border-neutral-200 rounded-l-lg text-sm bg-neutral-50 hover:bg-neutral-100 transition-colors h-[46px] w-[85px] justify-center"
                        >
                          <span className="font-medium text-neutral-700">{selectedCountryCode.code}</span>
                          <ChevronDown className="h-4 w-4 text-neutral-400" />
                        </button>
                        {showCountryDropdown && (
                          <div className="absolute top-full left-0 mt-1 w-56 max-h-60 overflow-y-auto bg-white border border-neutral-200 rounded-lg shadow-lg z-50">
                            {COUNTRY_CODES.map((country, index) => (
                              <button
                                key={`${country.code}-${country.country}-${index}`}
                                type="button"
                                onClick={() => handleCountryCodeChange(country)}
                                className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 flex items-center justify-between ${selectedCountryCode.code === country.code && selectedCountryCode.country === country.country
                                  ? 'bg-red-50 text-[#E22B2B]'
                                  : ''
                                  }`}
                              >
                                <span className="text-neutral-700">{country.name}</span>
                                <span className="text-neutral-400">{country.code}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={handlePhoneNumberChange}
                        onBlur={(e) => {
                          if (e.target.value.trim() && !isValidPhoneNumber(e.target.value)) {
                            setFormErrors(prev => ({ ...prev, phoneNumber: true }));
                          }
                        }}
                        placeholder={`${'9'.repeat(selectedCountryCode.maxLength).slice(0, 4)}...`}
                        maxLength={selectedCountryCode.maxLength}
                        className={`flex-1 min-w-0 px-4 py-3 border rounded-r-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E22B2B]/20 focus:border-[#E22B2B] h-[46px] ${formErrors.phoneNumber ? 'border-[#E22B2B] ring-2 ring-[#E22B2B]/20' : 'border-neutral-200'
                          }`}
                      />
                    </div>
                    <p className="mt-1 text-xs text-neutral-400">Enter {selectedCountryCode.maxLength} digits. Viber/WhatsApp supported.</p>
                    {formErrors.phoneNumber && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-[#E22B2B]">
                        <AlertCircle className="h-3 w-3" />
                        <span>Please enter exactly {selectedCountryCode.maxLength} digits</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pickup Location */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Pickup Location
                  </label>
                  <select
                    value={pickupLocation}
                    onChange={(e) => {
                      setPickupLocation(e.target.value);
                      if (e.target.value) setFormErrors(prev => ({ ...prev, pickupLocation: false }));
                    }}
                    className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E22B2B]/20 focus:border-[#E22B2B] appearance-none bg-white cursor-pointer ${formErrors.pickupLocation ? 'border-[#E22B2B] ring-2 ring-[#E22B2B]/20' : 'border-neutral-200'
                      }`}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                  >
                    <option value="">Select pickup location</option>
                    {LOCATION_OPTIONS.map(loc => (
                      <option key={`pickup-${loc.name}`} value={loc.name}>
                        {loc.name}{loc.cost > 0 ? ` (+₱${loc.cost.toLocaleString()})` : ''}
                      </option>
                    ))}
                  </select>
                  {pickupLocation && pickupLocationCost > 0 && (
                    <p className="mt-1 text-xs text-green-600 font-medium">
                      +₱{pickupLocationCost.toLocaleString()} pickup fee
                    </p>
                  )}
                  {formErrors.pickupLocation && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-[#E22B2B]">
                      <AlertCircle className="h-3 w-3" />
                      <span>Please select pickup location</span>
                    </div>
                  )}
                </div>

                {/* Drop-off Location */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Drop-off Location
                  </label>
                  <select
                    value={dropoffLocation}
                    onChange={(e) => {
                      setDropoffLocation(e.target.value);
                      if (e.target.value) setFormErrors(prev => ({ ...prev, dropoffLocation: false }));
                    }}
                    className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E22B2B]/20 focus:border-[#E22B2B] appearance-none bg-white cursor-pointer ${formErrors.dropoffLocation ? 'border-[#E22B2B] ring-2 ring-[#E22B2B]/20' : 'border-neutral-200'
                      }`}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                  >
                    <option value="">Select drop-off location</option>
                    {LOCATION_OPTIONS.map(loc => (
                      <option key={`dropoff-${loc.name}`} value={loc.name}>
                        {loc.name}{loc.cost > 0 ? ` (+₱${loc.cost.toLocaleString()})` : ''}
                      </option>
                    ))}
                  </select>
                  {dropoffLocation && dropoffLocationCost > 0 && (
                    <p className="mt-1 text-xs text-green-600 font-medium">
                      +₱{dropoffLocationCost.toLocaleString()} drop-off fee
                    </p>
                  )}
                  {formErrors.dropoffLocation && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-[#E22B2B]">
                      <AlertCircle className="h-3 w-3" />
                      <span>Please select drop-off location</span>
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
                      className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E22B2B]/20 focus:border-[#E22B2B] ${formErrors.pickupDate ? 'border-[#E22B2B] ring-2 ring-[#E22B2B]/20' : 'border-neutral-200'
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
                      className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E22B2B]/20 focus:border-[#E22B2B] ${formErrors.returnDate ? 'border-[#E22B2B] ring-2 ring-[#E22B2B]/20' : 'border-neutral-200'
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
                  className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${driveOption === 'self-drive'
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
                  className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${driveOption === 'with-driver'
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
                      <span className="text-sm font-medium text-[#E22B2B]">₱{DRIVER_COST.base.toLocaleString()}<span className="text-neutral-400 font-normal">/{DRIVER_COST.baseHours}hrs</span></span>
                    </div>
                    <p className="text-sm text-neutral-500 mt-0.5">Professional driver for your rental period</p>
                    <p className="text-xs text-amber-600 mt-1">₱150 per additional hour</p>
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
                    <p className="font-medium text-neutral-900">{dropoffLocation || 'Not selected yet'}</p>
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
                {pickupLocationCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Pickup ({pickupLocation})</span>
                    <span className="font-medium text-neutral-900">₱{pickupLocationCost.toLocaleString()}</span>
                  </div>
                )}
                {dropoffLocationCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Drop-off ({dropoffLocation})</span>
                    <span className="font-medium text-neutral-900">₱{dropoffLocationCost.toLocaleString()}</span>
                  </div>
                )}
                {driveOption === 'with-driver' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Driver Fee</span>
                    <span className="font-medium text-amber-600">₱{driverCost.toLocaleString()} (pay to driver)</span>
                  </div>
                )}
                {carWashFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Car Wash Fee</span>
                    <span className="font-medium text-neutral-900">₱{carWashFee.toLocaleString()}</span>
                  </div>
                )}
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
                disabled={!isFormComplete}
                className={`border-none rounded-full py-3.5 text-base font-medium transition-all ${isFormComplete
                  ? 'bg-[#E22B2B] hover:bg-[#c92525] cursor-pointer'
                  : 'bg-neutral-300 cursor-not-allowed'
                  }`}
              >
                Proceed to Payment
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Rental Agreement Modal */}
      <CarRentalAgreementModal
        isOpen={showAgreementModal}
        onClose={() => setShowAgreementModal(false)}
        onAgree={handleAgreementAccepted}
        isSelfDrive={driveOption === 'self-drive'}
        carWashFee={vehicle.carWashFee}
        lateReturnFeePerHour={vehicle.lateReturnFeePerHour}
      />
    </div>
  );
};

export default BookingPage;
