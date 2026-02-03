import { type FC, useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Button, CarCard } from '@/components/ui';
import type { Car } from '@/types';
import { initSession, updateVehicle, getSession } from '@/utils/sessionManager';
import { vehicleService } from '@/services/vehicleService';

/**
 * Types
 */
interface FilterState {
  carTypes: string[];
  transmissions: string[];
  seats: string[];
  priceRange: { min: number; max: number };
}

/**
 * Filter Sidebar Component
 */
const FilterSidebar: FC<{
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}> = ({ filters, onFilterChange }) => {
  const carTypes = [
    { value: 'sedan', label: 'Sedan', count: 2 },
    { value: 'suv', label: 'SUV', count: 5 },
    { value: 'van', label: 'Van', count: 3 },
  ];

  const transmissions = [
    { value: 'automatic', label: 'Automatic' },
    { value: 'manual', label: 'Manual' },
  ];

  const seatOptions = [
    { value: '2-5', label: '2 - 5 Seats' },
    { value: '6-8', label: '6 - 8 Seats' },
    { value: '9+', label: '9+ Seats' },
  ];

  const toggleCarType = (type: string) => {
    const currentTypes = [...filters.carTypes];
    const index = currentTypes.indexOf(type);
    
    if (index > -1) {
      currentTypes.splice(index, 1);
    } else {
      currentTypes.push(type);
    }
    
    onFilterChange({ 
      carTypes: currentTypes,
      transmissions: [...filters.transmissions],
      seats: [...filters.seats],
      priceRange: { ...filters.priceRange }
    });
  };

  const toggleTransmission = (trans: string) => {
    const currentTrans = [...filters.transmissions];
    const index = currentTrans.indexOf(trans);
    
    if (index > -1) {
      currentTrans.splice(index, 1);
    } else {
      currentTrans.push(trans);
    }
    
    onFilterChange({ 
      carTypes: [...filters.carTypes],
      transmissions: currentTrans,
      seats: [...filters.seats],
      priceRange: { ...filters.priceRange }
    });
  };

  const toggleSeats = (seatRange: string) => {
    const currentSeats = [...filters.seats];
    const index = currentSeats.indexOf(seatRange);
    
    if (index > -1) {
      currentSeats.splice(index, 1);
    } else {
      currentSeats.push(seatRange);
    }
    
    onFilterChange({ 
      carTypes: [...filters.carTypes],
      transmissions: [...filters.transmissions],
      seats: currentSeats,
      priceRange: { ...filters.priceRange }
    });
  };

  const resetFilters = () => {
    onFilterChange({
      carTypes: [],
      transmissions: [],
      seats: [],
      priceRange: { min: 1000, max: 5000 },
    });
  };

  return (
    <div className="space-y-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Filters Card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="font-semibold text-neutral-900">Filters</span>
          </div>
          <button 
            onClick={resetFilters}
            className="text-[#E22B2B] text-sm font-medium hover:text-[#c92525]"
          >
            Reset
          </button>
        </div>

        {/* Divider 1 */}
        <div className="border-t border-neutral-200 mb-4"></div>

        {/* Car Type */}
        <div className="pb-4">
          <h4 className="font-semibold text-neutral-900 text-sm mb-3">Car Type</h4>
          <div className="space-y-2">
            {carTypes.map((type) => {
              const isChecked = filters.carTypes.includes(type.value);
              return (
                <div 
                  key={type.value} 
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => toggleCarType(type.value)}
                  role="checkbox"
                  aria-checked={isChecked}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleCarType(type.value);
                    }
                  }}
                >
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      isChecked 
                        ? 'bg-[#D32F2F] border-[#D32F2F]' 
                        : 'bg-white border-[#D1D5DB] hover:border-[#9CA3AF]'
                    }`}
                  >
                    {isChecked && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-neutral-700 text-sm select-none">{type.label}</span>
                  <span className="text-neutral-400 text-xs">({type.count})</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider 2 */}
        <div className="border-t border-neutral-200 mb-4"></div>

        {/* Transmission */}
        <div className="pb-4">
          <h4 className="font-semibold text-neutral-900 text-sm mb-3">Transmission</h4>
          <div className="space-y-2">
            {transmissions.map((trans) => {
              const isChecked = filters.transmissions.includes(trans.value);
              return (
                <div 
                  key={trans.value} 
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => toggleTransmission(trans.value)}
                  role="checkbox"
                  aria-checked={isChecked}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleTransmission(trans.value);
                    }
                  }}
                >
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      isChecked 
                        ? 'bg-[#D32F2F] border-[#D32F2F]' 
                        : 'bg-white border-[#D1D5DB] hover:border-[#9CA3AF]'
                    }`}
                  >
                    {isChecked && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-neutral-700 text-sm select-none">{trans.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider 3 */}
        <div className="border-t border-neutral-200 mb-4"></div>

        {/* Number of Seats */}
        <div className="pb-4">
          <h4 className="font-semibold text-neutral-900 text-sm mb-3">Number of Seats</h4>
          <div className="space-y-2">
            {seatOptions.map((seatOpt) => {
              const isChecked = filters.seats.includes(seatOpt.value);
              return (
                <div 
                  key={seatOpt.value} 
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => toggleSeats(seatOpt.value)}
                  role="checkbox"
                  aria-checked={isChecked}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleSeats(seatOpt.value);
                    }
                  }}
                >
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      isChecked 
                        ? 'bg-[#D32F2F] border-[#D32F2F]' 
                        : 'bg-white border-[#D1D5DB] hover:border-[#9CA3AF]'
                    }`}
                  >
                    {isChecked && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-neutral-700 text-sm select-none">{seatOpt.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider 4 */}
        <div className="border-t border-neutral-200 mb-4"></div>

        {/* Daily Price */}
        <div>
          <h4 className="font-semibold text-neutral-900 text-sm mb-3">Daily Price</h4>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={filters.priceRange.min}
              onChange={(e) => onFilterChange({ 
                ...filters, 
                priceRange: { ...filters.priceRange, min: Number(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
              placeholder="₱ 1000"
            />
            <span className="text-neutral-400">-</span>
            <input
              type="number"
              value={filters.priceRange.max}
              onChange={(e) => onFilterChange({ 
                ...filters, 
                priceRange: { ...filters.priceRange, max: Number(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
              placeholder="₱ 5000"
            />
          </div>
        </div>
      </div>

      {/* Need Help Card - Separate */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <div className="flex items-start gap-3">
          {/* Red Call Agent Icon */}
          <div className="flex-shrink-0">
            <svg className="h-10 w-10 text-[#E22B2B]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-neutral-900 text-sm mb-1">Need Help?</h4>
            <p className="text-neutral-500 text-xs mb-2">
              Call our team for custom requests and inquiries.
            </p>
            <a 
              href="tel:+639177234567" 
              className="text-[#E22B2B] font-semibold text-sm hover:text-[#c92525]"
            >
              +63 917 723 4567
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Browse Vehicles Page
 */
export const BrowseVehiclesPage: FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Vehicle state
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);

  const [filters, setFilters] = useState<FilterState>({
    carTypes: [],
    transmissions: [],
    seats: [],
    priceRange: { min: 1000, max: 5000 },
  });

  const [sortBy, setSortBy] = useState('recommended');
  const [visibleCount, setVisibleCount] = useState(6);

  // Fetch vehicles from database on mount
  useEffect(() => {
    const loadVehicles = async () => {
      setIsLoadingVehicles(true);
      const { data, error } = await vehicleService.getAvailableForBrowse();
      
      if (error) {
        console.error('Failed to load vehicles:', error);
        // Keep loading state to show error or empty state
      } else {
        setAllCars(data || []);
        console.log('✅ Loaded vehicles from database:', data?.length || 0);
      }
      
      setIsLoadingVehicles(false);
    };
    
    loadVehicles();
  }, []);

  // Handle booking a car - navigate to booking page
  const handleBookNow = async (car: Car) => {
    // No validation needed - customer will provide details on booking page
    // Save vehicle to session
    await updateVehicle(car);

    // Navigate to booking page with vehicle data
    navigate('/browsevehicles/booking', {
      state: {
        vehicle: car,
      },
    });
  };

  // Initialize session on mount
  useEffect(() => {
    const session = getSession();
    if (!session.sessionId) {
      initSession();
    }
  }, []);

  // Load search parameters from URL on component mount
  useEffect(() => {
    // Read preference filters from URL (from landing page)
    const carType = searchParams.get('carType');
    const transmission = searchParams.get('transmission');
    const seats = searchParams.get('seats');

    // Apply preference filters if they exist
    const newFilters: FilterState = {
      carTypes: [],
      transmissions: [],
      seats: [],
      priceRange: { min: 1000, max: 5000 },
    };

    // Apply car type filter from URL
    if (carType && (carType === 'sedan' || carType === 'suv' || carType === 'van')) {
      newFilters.carTypes = [carType];
    }

    // Apply transmission filter from URL
    if (transmission && (transmission === 'automatic' || transmission === 'manual')) {
      newFilters.transmissions = [transmission];
    }

    // Apply seats filter from URL
    if (seats && (seats === '2-5' || seats === '6-8' || seats === '9+')) {
      newFilters.seats = [seats];
    }

    setFilters(newFilters);
  }, [searchParams]);

  // Filter cars based on selected filters
  const filteredCars = allCars.filter((car) => {
    // Filter by car type
    if (filters.carTypes.length > 0 && !filters.carTypes.includes(car.category)) {
      return false;
    }

    // Filter by transmission
    if (filters.transmissions.length > 0 && !filters.transmissions.includes(car.transmission)) {
      return false;
    }

    // Filter by seats (from URL parameter or sidebar filter)
    const seatsParam = searchParams.get('seats');
    const seatsFilter = seatsParam || (filters.seats.length > 0 ? filters.seats : null);
    
    if (seatsFilter) {
      const seatRanges = Array.isArray(seatsFilter) ? seatsFilter : [seatsFilter];
      let matchesSeats = false;
      
      for (const range of seatRanges) {
        if (range === '2-5' && car.seats >= 2 && car.seats <= 5) {
          matchesSeats = true;
          break;
        }
        if (range === '6-8' && car.seats >= 6 && car.seats <= 8) {
          matchesSeats = true;
          break;
        }
        if (range === '9+' && car.seats >= 9) {
          matchesSeats = true;
          break;
        }
      }
      
      if (!matchesSeats) {
        return false;
      }
    }

    // Filter by price range
    if (car.pricePerDay < filters.priceRange.min || car.pricePerDay > filters.priceRange.max) {
      return false;
    }

    return true;
  });

  // Sort cars
  const sortedCars = [...filteredCars].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.pricePerDay - b.pricePerDay;
      case 'price-high':
        return b.pricePerDay - a.pricePerDay;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const visibleCars = sortedCars.slice(0, visibleCount);
  const hasMore = visibleCount < sortedCars.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Main Content */}
      <div className="mx-auto w-full max-w-7xl py-8" style={{ paddingInline: 'clamp(1rem, 5vw, 5rem)' }}>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Hidden on mobile */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar
              filters={filters}
              onFilterChange={setFilters}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">
                  Available Vehicles for Your Trip
                </h1>
                <p className="text-neutral-500 text-sm">
                  Showing {filteredCars.length} available cars in Cebu
                </p>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-neutral-500 text-sm">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-neutral-200 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-neutral-700 cursor-pointer hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#E22B2B]/20"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rating</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                fullWidth
                onClick={() => {/* TODO: Open mobile filter modal */}}
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </Button>
            </div>

            {/* Cars Grid */}
            <div id="cars-section" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {isLoadingVehicles ? (
                <div className="col-span-full text-center py-16">
                  <p className="text-neutral-500">Loading vehicles...</p>
                </div>
              ) : (
                visibleCars.map((car) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    onBookNow={handleBookNow}
                    showAvailability
                  />
                ))
              )}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  className="px-8"
                >
                  Load More Vehicles
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}

            {/* No Results */}
            {filteredCars.length === 0 && !isLoadingVehicles && (
              <div className="text-center py-16">
                <p className="text-neutral-500 text-lg">No vehicles match your filters.</p>
                <button
                  onClick={() => setFilters({
                    carTypes: [],
                    transmissions: [],
                    seats: [],
                    priceRange: { min: 1000, max: 5000 },
                  })}
                  className="mt-4 text-[#E22B2B] font-medium hover:text-[#c92525]"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseVehiclesPage;
