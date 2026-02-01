import { type FC, useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronDown, AlertCircle, Calendar } from 'lucide-react';
import { Button, CarCard, LocationPickerModal, BookingDateModal, type BookingData } from '@/components/ui';
import type { Car } from '@/types';
import { initSession, updateSearchCriteria, updateVehicle, getSession } from '@/utils/sessionManager';
import { vehicleService } from '@/services/vehicleService';

/**
 * Types
 */
interface FilterState {
  carTypes: string[];
  transmissions: string[];
  priceRange: { min: number; max: number };
}

interface SearchFormProps {
  searchCriteria: {
    location: string;
    pickupDate: string;
    returnDate: string;
  };
  onLocationClick: () => void;
  onDateClick: () => void;
  onSearchChange: (params: { location: string; pickupDate: string; returnDate: string }) => void;
  onSearch: () => void;
  errors: {
    location: boolean;
    pickupDate: boolean;
    returnDate: boolean;
  };
}

/**
 * Search Form Component
 */
const SearchForm: FC<SearchFormProps> = ({ 
  searchCriteria, 
  onLocationClick, 
  onDateClick, 
  onSearch, 
  errors 
}) => {
  // Format date for display
  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white border-b border-neutral-200">
      <div className="mx-auto w-full max-w-7xl py-4" style={{ paddingInline: 'clamp(1rem, 5vw, 5rem)' }}>
        <div className="flex flex-col lg:flex-row gap-3 items-stretch">
          {/* Location */}
          <div className="flex-1 w-full lg:w-auto">
            <button
              onClick={onLocationClick}
              className={`w-full h-10 px-3 text-left border rounded-lg bg-white hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#E22B2B]/20 text-sm flex items-center gap-2 ${
                errors.location ? 'border-[#E22B2B] ring-2 ring-[#E22B2B]/20' : 'border-neutral-200'
              }`}
            >
              <MapPin className={`h-4 w-4 ${errors.location ? 'text-[#E22B2B]' : 'text-neutral-400'}`} />
              <span className={`${searchCriteria.location ? 'text-neutral-900' : 'text-neutral-500'}`}>
                {searchCriteria.location || 'City, Airport, or Address'}
              </span>
            </button>
            {errors.location && (
              <div className="flex items-center gap-1 mt-1 text-xs text-[#E22B2B]">
                <AlertCircle className="h-3 w-3" />
                <span>Please select a location</span>
              </div>
            )}
          </div>

          {/* Pickup Date */}
          <div className="flex-1 w-full lg:w-auto">
            <button
              type="button"
              onClick={onDateClick}
              className={`w-full h-10 px-3 text-left border rounded-lg bg-white hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#E22B2B]/20 text-sm flex items-center gap-2 ${
                errors.pickupDate ? 'border-[#E22B2B] ring-2 ring-[#E22B2B]/20' : 'border-neutral-200'
              }`}
            >
              <Calendar className={`h-4 w-4 ${errors.pickupDate ? 'text-[#E22B2B]' : 'text-neutral-400'}`} />
              <span className={`${searchCriteria.pickupDate ? 'text-neutral-900' : 'text-neutral-500'}`}>
                {searchCriteria.pickupDate ? formatDateDisplay(searchCriteria.pickupDate) : 'Select Date'}
              </span>
            </button>
            {errors.pickupDate && (
              <div className="flex items-center gap-1 mt-1 text-xs text-[#E22B2B]">
                <AlertCircle className="h-3 w-3" />
                <span>Please select pickup date</span>
              </div>
            )}
          </div>

          {/* Return Date */}
          <div className="flex-1 w-full lg:w-auto">
            <button
              type="button"
              onClick={onDateClick}
              className={`w-full h-10 px-3 text-left border rounded-lg bg-white hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#E22B2B]/20 text-sm flex items-center gap-2 ${
                errors.returnDate ? 'border-[#E22B2B] ring-2 ring-[#E22B2B]/20' : 'border-neutral-200'
              }`}
            >
              <Calendar className={`h-4 w-4 ${errors.returnDate ? 'text-[#E22B2B]' : 'text-neutral-400'}`} />
              <span className={`${searchCriteria.returnDate ? 'text-neutral-900' : 'text-neutral-500'}`}>
                {searchCriteria.returnDate ? formatDateDisplay(searchCriteria.returnDate) : 'Select Date'}
              </span>
            </button>
            {errors.returnDate && (
              <div className="flex items-center gap-1 mt-1 text-xs text-[#E22B2B]">
                <AlertCircle className="h-3 w-3" />
                <span>Please select return date</span>
              </div>
            )}
          </div>

          {/* Search Button - Just icon with red background */}
          <button
            onClick={onSearch}
            className="w-full lg:w-12 h-10 bg-[#E22B2B] hover:bg-[#c92525] text-white rounded-lg flex items-center justify-center transition-colors"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

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

  const toggleCarType = (type: string) => {
    const newTypes = filters.carTypes.includes(type)
      ? filters.carTypes.filter(t => t !== type)
      : [...filters.carTypes, type];
    onFilterChange({ ...filters, carTypes: newTypes });
  };

  const toggleTransmission = (trans: string) => {
    const newTrans = filters.transmissions.includes(trans)
      ? filters.transmissions.filter(t => t !== trans)
      : [...filters.transmissions, trans];
    onFilterChange({ ...filters, transmissions: newTrans });
  };

  const resetFilters = () => {
    onFilterChange({
      carTypes: [],
      transmissions: [],
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
  
  const [searchCriteria, setSearchCriteria] = useState({
    location: '',
    pickupDate: '',
    returnDate: '',
    startTime: '',
    deliveryMethod: '',
  });

  const [filters, setFilters] = useState<FilterState>({
    carTypes: [],
    transmissions: [],
    priceRange: { min: 1000, max: 5000 },
  });

  const [sortBy, setSortBy] = useState('recommended');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [validationErrors, setValidationErrors] = useState({
    location: false,
    pickupDate: false,
    returnDate: false,
  });

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
    // Validate that search form is filled
    const errors = {
      location: !searchCriteria.location,
      pickupDate: !searchCriteria.pickupDate,
      returnDate: !searchCriteria.returnDate,
    };

    // Check if any field has errors
    if (errors.location || errors.pickupDate || errors.returnDate) {
      setValidationErrors(errors);
      // Scroll to search form
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Clear any previous errors
    setValidationErrors({ location: false, pickupDate: false, returnDate: false });

    // Save to session before navigating
    await updateSearchCriteria({
      pickupLocation: searchCriteria.location,
      pickupDate: searchCriteria.pickupDate,
      returnDate: searchCriteria.returnDate,
      startTime: searchCriteria.startTime,
      deliveryMethod: 'pickup'
    });
    
    await updateVehicle(car);

    navigate('/browsevehicles/booking', {
      state: {
        vehicle: car,
        searchCriteria,
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
    const location = searchParams.get('location') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const startTime = searchParams.get('startTime') || '';
    const deliveryMethod = searchParams.get('deliveryMethod') || '';

    setSearchCriteria({
      location,
      pickupDate: startDate,
      returnDate: endDate,
      startTime,
      deliveryMethod,
    });

    // Set booking data for date modal
    if (startDate && endDate) {
      setBookingData({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        startTime,
        endTime: startTime, // Same as start time
        deliveryMethod,
      });
    }
  }, [searchParams]);

  const handleSearchChange = (params: { location: string; pickupDate: string; returnDate: string }) => {
    setSearchCriteria(prev => ({
      ...prev,
      ...params
    }));
    // Clear validation errors when user starts filling the form
    setValidationErrors(prev => ({
      location: params.location ? false : prev.location,
      pickupDate: params.pickupDate ? false : prev.pickupDate,
      returnDate: params.returnDate ? false : prev.returnDate,
    }));
  };

  const handleLocationConfirm = (location: string) => {
    setSearchCriteria(prev => ({ ...prev, location }));
    // Clear location error
    setValidationErrors(prev => ({ ...prev, location: false }));
  };

  const handleDateConfirm = (data: BookingData) => {
    setBookingData(data);
    setSearchCriteria(prev => ({
      ...prev,
      pickupDate: data.startDate?.toISOString().split('T')[0] || '',
      returnDate: data.endDate?.toISOString().split('T')[0] || '',
      startTime: data.startTime,
      deliveryMethod: data.deliveryMethod,
    }));
  };

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

  const handleSearch = () => {
    // Implement search logic
    console.log('Search:', searchParams);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Search Form */}
      <SearchForm
        searchCriteria={searchCriteria}
        onLocationClick={() => setIsLocationModalOpen(true)}
        onDateClick={() => setIsDateModalOpen(true)}
        onSearchChange={handleSearchChange}
        onSearch={handleSearch}
        errors={validationErrors}
      />

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
            {filteredCars.length === 0 && (
              <div className="text-center py-16">
                <p className="text-neutral-500 text-lg">No vehicles match your filters.</p>
                <button
                  onClick={() => setFilters({
                    carTypes: [],
                    transmissions: [],
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

      {/* Modals */}
      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onConfirm={handleLocationConfirm}
        initialLocation={searchCriteria.location}
      />

      <BookingDateModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        onConfirm={handleDateConfirm}
        initialData={bookingData || undefined}
      />
    </div>
  );
};

export default BrowseVehiclesPage;
