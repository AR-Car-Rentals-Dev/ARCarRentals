import { type FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Car as CarIcon, Cog, Users } from 'lucide-react';
import { Button } from '@/components/ui';
import type { CarCategory, TransmissionType } from '@/types';

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
  const [carType, setCarType] = useState<CarCategory | ''>('');
  const [transmission, setTransmission] = useState<TransmissionType | ''>('');
  const [seats, setSeats] = useState<string>('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build URL parameters from preference filters
    const params = new URLSearchParams();
    
    if (carType) {
      params.append('carType', carType);
    }
    
    if (transmission) {
      params.append('transmission', transmission);
    }
    
    if (seats) {
      params.append('seats', seats);
    }
    
    // Navigate to browse vehicles page with filter parameters
    navigate(`/browsevehicles?${params.toString()}`);
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
                {/* Car Type */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-neutral-500 mb-2">
                    CAR TYPE
                  </label>
                  <div className="relative">
                    <CarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 pointer-events-none" />
                    <select
                      value={carType}
                      onChange={(e) => setCarType(e.target.value as CarCategory | '')}
                      className="w-full pl-11 pr-4 py-3 border border-neutral-200 rounded-lg appearance-none bg-white hover:border-[#E22B2B] focus:border-[#E22B2B] focus:outline-none focus:ring-2 focus:ring-[#E22B2B]/20 transition-colors text-neutral-900"
                    >
                      <option value="">All Types</option>
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                      <option value="van">Van</option>
                    </select>
                  </div>
                </div>

                {/* Transmission */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-neutral-500 mb-2">
                    TRANSMISSION
                  </label>
                  <div className="relative">
                    <Cog className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 pointer-events-none" />
                    <select
                      value={transmission}
                      onChange={(e) => setTransmission(e.target.value as TransmissionType | '')}
                      className="w-full pl-11 pr-4 py-3 border border-neutral-200 rounded-lg appearance-none bg-white hover:border-[#E22B2B] focus:border-[#E22B2B] focus:outline-none focus:ring-2 focus:ring-[#E22B2B]/20 transition-colors text-neutral-900"
                    >
                      <option value="">Any</option>
                      <option value="automatic">Automatic</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>
                </div>

                {/* Number of Seats */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-neutral-500 mb-2">
                    NUMBER OF SEATS
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 pointer-events-none" />
                    <select
                      value={seats}
                      onChange={(e) => setSeats(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-neutral-200 rounded-lg appearance-none bg-white hover:border-[#E22B2B] focus:border-[#E22B2B] focus:outline-none focus:ring-2 focus:ring-[#E22B2B]/20 transition-colors text-neutral-900"
                    >
                      <option value="">Any</option>
                      <option value="2-5">2 - 5 Seats</option>
                      <option value="6-8">6 - 8 Seats</option>
                      <option value="9+">9+ Seats</option>
                    </select>
                  </div>
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
                    Find Available Cars
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
