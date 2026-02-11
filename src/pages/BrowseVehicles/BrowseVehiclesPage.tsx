import { type FC, useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Button, CarCard, VehicleDetailsModal } from '@/components/ui';
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
  allCars: Car[];
}> = ({ filters, onFilterChange, allCars }) => {
  // Calculate counts dynamically from database
  const carTypes = [
    { value: 'sedan', label: 'Sedan', count: allCars.filter(c => c.category === 'sedan').length },
    { value: 'suv', label: 'SUV', count: allCars.filter(c => c.category === 'suv').length },
    { value: 'mpv', label: 'MPV', count: allCars.filter(c => c.category === 'mpv').length },
    { value: 'van', label: 'Van', count: allCars.filter(c => c.category === 'van').length },
  ];

  const transmissions = [
    { value: 'automatic', label: 'Automatic', count: allCars.filter(c => c.transmission === 'automatic').length },
    { value: 'manual', label: 'Manual', count: allCars.filter(c => c.transmission === 'manual').length },
  ];

  // Helper function to get numeric seat value
  const getCarSeatValue = (seats: number | string): number => {
    if (typeof seats === 'number') return seats;
    if (typeof seats === 'string') {
      if (seats.includes('-')) {
        return parseInt(seats.split('-')[0]) || 0;
      }
      return parseInt(seats) || 0;
    }
    return 0;
  };

  const seatOptions = [
    { value: '2-5', label: '2 - 5 Seats', count: allCars.filter(c => { const val = getCarSeatValue(c.seats); return val >= 2 && val <= 5; }).length },
    { value: '6-8', label: '6 - 8 Seats', count: allCars.filter(c => { const val = getCarSeatValue(c.seats); return val >= 6 && val <= 8; }).length },
    { value: '9+', label: '9+ Seats', count: allCars.filter(c => { const val = getCarSeatValue(c.seats); return val >= 9; }).length },
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
      <div className="bg-white rounded-[14px] border border-[#e9e9ee] p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-[#1f1f1f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="font-bold text-[#1f1f1f]">Filters</span>
          </div>
          <button
            onClick={resetFilters}
            className="text-[#e53935] text-sm font-semibold hover:text-[#c62828] transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Divider 1 */}
        <div className="border-t border-[#eaeaf0] mb-5"></div>

        {/* Car Type */}
        <div className="pb-5">
          <h4 className="font-bold text-[#1f1f1f] text-sm mb-3">Car Type</h4>
          <div className="space-y-2.5">
            {carTypes.map((type) => {
              const isChecked = filters.carTypes.includes(type.value);
              return (
                <div
                  key={type.value}
                  className="flex items-center gap-3 cursor-pointer group"
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
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isChecked
                        ? 'bg-[#e53935] border-[#e53935]'
                        : 'bg-white border-[#d1d5db] group-hover:border-[#9ca3af]'
                      }`}
                  >
                    {isChecked && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[#1f1f1f] text-sm select-none flex-1">{type.label}</span>
                  <span className="text-[#6b7280] text-xs">({type.count})</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider 2 */}
        <div className="border-t border-[#eaeaf0] mb-5"></div>

        {/* Transmission */}
        <div className="pb-5">
          <h4 className="font-bold text-[#1f1f1f] text-sm mb-3">Transmission</h4>
          <div className="space-y-2.5">
            {transmissions.map((trans) => {
              const isChecked = filters.transmissions.includes(trans.value);
              return (
                <div
                  key={trans.value}
                  className="flex items-center gap-3 cursor-pointer group"
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
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isChecked
                        ? 'bg-[#e53935] border-[#e53935]'
                        : 'bg-white border-[#d1d5db] group-hover:border-[#9ca3af]'
                      }`}
                  >
                    {isChecked && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[#1f1f1f] text-sm select-none flex-1">{trans.label}</span>
                  <span className="text-[#6b7280] text-xs">({trans.count})</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider 3 */}
        <div className="border-t border-[#eaeaf0] mb-5"></div>

        {/* Number of Seats */}
        <div className="pb-5">
          <h4 className="font-bold text-[#1f1f1f] text-sm mb-3">Number of Seats</h4>
          <div className="space-y-2.5">
            {seatOptions.map((seatOpt) => {
              const isChecked = filters.seats.includes(seatOpt.value);
              return (
                <div
                  key={seatOpt.value}
                  className="flex items-center gap-3 cursor-pointer group"
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
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isChecked
                        ? 'bg-[#e53935] border-[#e53935]'
                        : 'bg-white border-[#d1d5db] group-hover:border-[#9ca3af]'
                      }`}
                  >
                    {isChecked && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[#1f1f1f] text-sm select-none flex-1">{seatOpt.label}</span>
                  <span className="text-[#6b7280] text-xs">({seatOpt.count})</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider 4 */}
        <div className="border-t border-[#eaeaf0] mb-5"></div>

        {/* Daily Price */}
        <div>
          <h4 className="font-bold text-[#1f1f1f] text-sm mb-3">Daily Price</h4>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={filters.priceRange.min}
              onChange={(e) => onFilterChange({
                ...filters,
                priceRange: { ...filters.priceRange, min: Number(e.target.value) }
              })}
              className="w-full px-3 py-2.5 border border-[#eaeaf0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e53935]/20 focus:border-[#e53935]"
              placeholder="₱ 1000"
            />
            <span className="text-[#6b7280]">-</span>
            <input
              type="number"
              value={filters.priceRange.max}
              onChange={(e) => onFilterChange({
                ...filters,
                priceRange: { ...filters.priceRange, max: Number(e.target.value) }
              })}
              className="w-full px-3 py-2.5 border border-[#eaeaf0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e53935]/20 focus:border-[#e53935]"
              placeholder="₱ 5000"
            />
          </div>
        </div>
      </div>

      {/* Need Help Card - Separate */}
      <div className="bg-white rounded-[14px] border border-[#e9e9ee] p-5 shadow-sm">
        <div className="flex items-start gap-3">
          {/* Red Call Agent Icon */}
          <div className="flex-shrink-0">
            <svg className="h-10 w-10 text-[#e53935]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-[#1f1f1f] text-sm mb-1">Need Help?</h4>
            <p className="text-[#6b7280] text-xs mb-2">
              Call our team for custom requests and inquiries.
            </p>
            <a
              href="tel:+639177234567"
              className="text-[#e53935] font-semibold text-sm hover:text-[#c62828] transition-colors"
            >
              +63 956 662 5224
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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Vehicle state
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);

  // Modal state
  const [isVehicleDetailsModalOpen, setIsVehicleDetailsModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

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

  // Handle filter changes and sync with URL
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);

    // Update URL parameters
    const params = new URLSearchParams();

    if (newFilters.carTypes.length === 1) {
      params.set('carType', newFilters.carTypes[0]);
    }

    if (newFilters.transmissions.length === 1) {
      params.set('transmission', newFilters.transmissions[0]);
    }

    if (newFilters.seats.length === 1) {
      params.set('seats', newFilters.seats[0]);
    }

    setSearchParams(params);
  };

  // Handle booking a car - show vehicle details modal first
  const handleBookNow = (car: Car) => {
    setSelectedCar(car);
    setIsVehicleDetailsModalOpen(true);
  };

  // Proceed to booking page from vehicle details modal
  const handleProceedToBooking = async () => {
    if (!selectedCar) return;

    // Save vehicle to session
    await updateVehicle(selectedCar);

    // Close modal
    setIsVehicleDetailsModalOpen(false);

    // Navigate to booking page with vehicle data
    navigate('/browsevehicles/booking', {
      state: {
        vehicle: selectedCar,
      },
    });
  };

  const handleCloseVehicleDetails = () => {
    setIsVehicleDetailsModalOpen(false);
    setSelectedCar(null);
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
    if (carType && (carType === 'sedan' || carType === 'suv' || carType === 'mpv' || carType === 'van')) {
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

    // Filter by seats
    if (filters.seats.length > 0) {
      let matchesSeats = false;

      // Helper function to get numeric seat value from car.seats
      const getCarSeatValue = (seats: number | string): number => {
        if (typeof seats === 'number') return seats;
        if (typeof seats === 'string') {
          // If it's a range like "7-8", take the lower value for comparison
          if (seats.includes('-')) {
            return parseInt(seats.split('-')[0]) || 0;
          }
          return parseInt(seats) || 0;
        }
        return 0;
      };

      const carSeatValue = getCarSeatValue(car.seats);

      for (const range of filters.seats) {
        if (range === '2-5' && carSeatValue >= 2 && carSeatValue <= 5) {
          matchesSeats = true;
          break;
        }
        if (range === '6-8' && carSeatValue >= 6 && carSeatValue <= 8) {
          matchesSeats = true;
          break;
        }
        if (range === '9+' && carSeatValue >= 9) {
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

  // Category sort order: Sedan → SUV → MPV → Van
  const categoryOrder: Record<string, number> = {
    'sedan': 1,
    'suv': 2,
    'mpv': 3,
    'van': 4,
  };

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
        // Default: sort by category order (Sedan → SUV → MPV → Van)
        const orderA = categoryOrder[a.category] || 99;
        const orderB = categoryOrder[b.category] || 99;
        return orderA - orderB;
    }
  });

  const visibleCars = sortedCars.slice(0, visibleCount);
  const hasMore = visibleCount < sortedCars.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Hero Image */}
      <div className="relative h-[280px] md:h-[340px] w-full">
        <img
          src="/CCLEXOverlay.png"
          alt="Cebu scenic road"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
      </div>

      {/* White Overlapping Container */}
      <div
        className="relative bg-white rounded-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] mx-auto"
        style={{
          maxWidth: '1380px',
          marginTop: '-80px',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: '24px',
          paddingRight: '24px',
        }}
      >
        <div className="py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar - Hidden on mobile */}
            <div className="hidden lg:block" style={{ width: '280px', flexShrink: 0 }}>
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                allCars={allCars}
              />
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-[#1f1f1f] mb-1">
                    Available Vehicles for Your Trip
                  </h1>
                  <p className="text-[#6b7280] text-sm">
                    Showing {filteredCars.length} available cars in Cebu
                  </p>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[#6b7280] text-sm whitespace-nowrap">Sort by:</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white border border-[#eaeaf0] rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-[#1f1f1f] cursor-pointer hover:border-[#d1d1d6] focus:outline-none focus:ring-2 focus:ring-[#e53935]/20 transition-colors"
                    >
                      <option value="recommended">Recommended</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rating</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6b7280] pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Mobile Filter Button */}
              <div className="lg:hidden mb-6">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {/* TODO: Open mobile filter modal */ }}
                  className="border-[#eaeaf0]"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </Button>
              </div>

              {/* Cars Grid - 4 columns on large screens */}
              <div
                id="cars-section"
                className="grid gap-5"
                style={{
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                }}
              >
                {isLoadingVehicles ? (
                  <div className="col-span-full text-center py-16">
                    <p className="text-[#6b7280]">Loading vehicles...</p>
                  </div>
                ) : (
                  visibleCars.map((car) => (
                    <CarCard
                      key={car.id}
                      car={car}
                      onBookNow={handleBookNow}
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
                    className="px-8 border-[#eaeaf0] hover:border-[#e53935] hover:text-[#e53935]"
                  >
                    Load More Vehicles
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}

              {/* No Results */}
              {filteredCars.length === 0 && !isLoadingVehicles && (
                <div className="text-center py-16">
                  <p className="text-[#6b7280] text-lg">No vehicles match your filters.</p>
                  <button
                    onClick={() => setFilters({
                      carTypes: [],
                      transmissions: [],
                      seats: [],
                      priceRange: { min: 1000, max: 5000 },
                    })}
                    className="mt-4 text-[#e53935] font-medium hover:text-[#c62828] transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Spacing */}
      <div className="h-16"></div>

      {/* Vehicle Details Modal */}
      <VehicleDetailsModal
        isOpen={isVehicleDetailsModalOpen}
        onClose={handleCloseVehicleDetails}
        onProceedToBooking={handleProceedToBooking}
        vehicle={selectedCar ? {
          id: selectedCar.id,
          name: selectedCar.name,
          brand: selectedCar.brand,
          model: selectedCar.model,
          year: selectedCar.year,
          category: selectedCar.category,
          pricePerDay: selectedCar.pricePerDay,
          seats: selectedCar.seats,
          transmission: selectedCar.transmission,
          fuelType: selectedCar.fuelType,
          image: selectedCar.image,
          images: selectedCar.images,
          features: selectedCar.features,
        } : null}
      />
    </div>
  );
};

export default BrowseVehiclesPage;
