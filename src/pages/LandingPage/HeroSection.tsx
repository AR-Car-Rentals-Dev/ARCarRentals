import { type FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar } from 'lucide-react';
import { Button, BookingDateModal, LocationPickerModal, type BookingData } from '@/components/ui';

/**
 * Hero section with layered design
 * Layer 1 (bottom): White background
 * Layer 2: CCLEXOverlay.png at 30% opacity
 * Layer 3: Slanted red gradient
 * Layer 4: Header text (centered)
 * Layer 5 (top): Hero image
 */
export const HeroSection: FC = () => {
  const navigate = useNavigate();
  const [pickupLocation, setPickupLocation] = useState('');
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [shouldOpenDateModalNext, setShouldOpenDateModalNext] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if required data is missing and trigger modal sequence
    if (!pickupLocation || !bookingData?.startDate || !bookingData?.endDate) {
      setShouldOpenDateModalNext(true);
      setIsLocationModalOpen(true);
      return;
    }
    
    // Build URL parameters from search data
    const params = new URLSearchParams();
    
    if (pickupLocation) {
      params.append('location', pickupLocation);
    }
    
    if (bookingData?.startDate) {
      params.append('startDate', bookingData.startDate.toISOString().split('T')[0]);
    }
    
    if (bookingData?.endDate) {
      params.append('endDate', bookingData.endDate.toISOString().split('T')[0]);
    }
    
    if (bookingData?.startTime) {
      params.append('startTime', bookingData.startTime);
    }
    
    if (bookingData?.deliveryMethod) {
      params.append('deliveryMethod', bookingData.deliveryMethod);
    }
    
    // Navigate to browse vehicles page with search parameters
    navigate(`/browsevehicles?${params.toString()}`);
  };

  const handleDateConfirm = (data: BookingData) => {
    setBookingData(data);
    setIsDateModalOpen(false);
    setShouldOpenDateModalNext(false); // Complete the sequence
  };

  const handleLocationConfirm = (location: string) => {
    setPickupLocation(location);
    setIsLocationModalOpen(false);
    
    // If we're in a sequence, automatically open date modal
    if (shouldOpenDateModalNext) {
      setIsDateModalOpen(true);
    }
  };

  const handleLocationClose = () => {
    setIsLocationModalOpen(false);
    setShouldOpenDateModalNext(false); // Stop the flow if location modal is cancelled
  };

  const handleDateClose = () => {
    setIsDateModalOpen(false);
    // If user cancels date modal during sequence, go back to location modal
    if (shouldOpenDateModalNext) {
      setIsLocationModalOpen(true);
    }
  };

  // Handler for any form field click - starts the sequential modal flow
  const handleFieldClick = () => {
    setShouldOpenDateModalNext(true);
    setIsLocationModalOpen(true);
  };

  const formatDateDisplay = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <section className="relative">
      {/* Hero Area - adjusted height for viewport fit with sneak peek of testimonials */}
      <div className="relative h-[350px] sm:h-[420px] md:h-[calc(100vh-220px)] md:min-h-[500px] md:max-h-[600px] overflow-hidden">
        {/* Layer 1: White background */}
        <div className="absolute inset-0 bg-white" />

        {/* Layer 2: Overlay background at 30% opacity */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'url(/CCLEXOverlay.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Layer 3: Slanted red gradient at bottom */}
        <div 
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: '100px',
            background: 'linear-gradient(to right, #FB3030 0%, #480E0E 100%)',
            clipPath: 'polygon(0 100%, 0 calc(100% - 32px), 100% 0, 100% 100%)',
          }}
        />

        {/* Layer 4: Header text (centered) */}
        <div className="absolute inset-0 flex items-start justify-center pt-4 sm:pt-8 md:pt-16 z-10 px-4">
          <h1 
            className="text-center font-extrabold leading-[100.4%] text-[22px] sm:text-4xl md:text-5xl lg:text-[67.5px]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <span className="text-black">BEST </span>
            <span 
              style={{
                background: 'linear-gradient(135deg, #FB3030 0%, #9F0303 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              CAR RENTAL
            </span>
            <span className="text-black"> AND</span>
            <br />
            <span className="text-black">TOUR SERVICES IN </span>
            <span 
              style={{
                background: 'linear-gradient(135deg, #FB3030 0%, #9F0303 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              CEBU CITY
            </span>
          </h1>
        </div>

        {/* Layer 5: Hero image (top layer) - positioned to show more of the car on mobile */}
        <div className="absolute inset-0 flex items-end justify-center z-20 pointer-events-none">
          <img
            src="/carSectionImage.png"
            alt="Premium car"
            className="w-[130%] sm:w-[110%] md:w-[80%] lg:w-[60%] h-auto object-contain translate-y-[10%] sm:translate-y-0"
          />
        </div>
      </div>

      {/* Search Form - Below Hero */}
      <div className="relative z-30 -mt-8 sm:-mt-12 pb-8 sm:pb-16 mx-auto w-full max-w-7xl" style={{ paddingInline: 'clamp(1rem, 5vw, 5rem)' }}>
        <div className="max-w-6xl mx-auto">
          <form onSubmit={handleSearch}>
            <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Location */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-neutral-500 mb-2">
                    PICK-UP PLACE
                  </label>
                  <button
                    type="button"
                    onClick={handleFieldClick}
                    className="w-full flex items-center gap-3 px-4 py-3 border border-neutral-200 rounded-lg text-left hover:border-[#E22B2B] transition-colors"
                  >
                    <MapPin className="h-5 w-5 text-neutral-400" />
                    <span className={pickupLocation ? 'text-neutral-900 truncate' : 'text-neutral-400'}>
                      {pickupLocation || 'City, Airport, or Address'}
                    </span>
                  </button>
                </div>

                {/* Start Date */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-neutral-500 mb-2">
                    START DATE
                  </label>
                  <button
                    type="button"
                    onClick={handleFieldClick}
                    className="w-full flex items-center gap-3 px-4 py-3 border border-neutral-200 rounded-lg text-left hover:border-[#E22B2B] transition-colors"
                  >
                    <Calendar className="h-5 w-5 text-neutral-400" />
                    <span className={bookingData?.startDate ? 'text-neutral-900' : 'text-neutral-400'}>
                      {bookingData?.startDate 
                        ? formatDateDisplay(bookingData.startDate)
                        : 'Select Date'}
                    </span>
                  </button>
                </div>

                {/* Return Date */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-neutral-500 mb-2">
                    RETURN DATE
                  </label>
                  <button
                    type="button"
                    onClick={handleFieldClick}
                    className="w-full flex items-center gap-3 px-4 py-3 border border-neutral-200 rounded-lg text-left hover:border-[#E22B2B] transition-colors"
                  >
                    <Calendar className="h-5 w-5 text-neutral-400" />
                    <span className={bookingData?.endDate ? 'text-neutral-900' : 'text-neutral-400'}>
                      {bookingData?.endDate 
                        ? formatDateDisplay(bookingData.endDate)
                        : 'Select Date'}
                    </span>
                  </button>
                </div>

                {/* Search Button */}
                <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    leftIcon={<Search className="h-5 w-5" />}
                  >
                    Find Car
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Booking Date Modal */}
      <BookingDateModal
        isOpen={isDateModalOpen}
        onClose={handleDateClose}
        onConfirm={handleDateConfirm}
        initialData={bookingData || undefined}
      />

      {/* Location Picker Modal */}
      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={handleLocationClose}
        onConfirm={handleLocationConfirm}
        initialLocation={pickupLocation}
      />
    </section>
  );
};

export default HeroSection;
