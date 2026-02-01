import { type FC, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, ChevronDown } from 'lucide-react';
import { Button, BookNowModal, CarCard, LocationPickerModal, BookingDateModal, type BookingData } from '@/components/ui';
import type { Car } from '@/types';

// Client's actual car fleet
const allCars: Car[] = [
  {
    id: 'b1a2c3d4-e5f6-7890-abcd-200000000001',
    name: 'Toyota Vios',
    brand: 'Toyota',
    model: 'Vios',
    year: 2024,
    category: 'sedan',
    pricePerDay: 1800,
    currency: 'PHP',
    seats: 5,
    transmission: 'automatic',
    fuelType: 'gasoline',
    image: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800&q=80',
    images: [],
    features: ['AC', 'Bluetooth', 'USB Charging'],
    available: true,
    rating: 4.8,
    reviewCount: 124,
  },
  {
    id: 'b1a2c3d4-e5f6-7890-abcd-200000000002',
    name: 'Toyota Wigo',
    brand: 'Toyota',
    model: 'Wigo',
    year: 2024,
    category: 'sedan',
    pricePerDay: 1500,
    currency: 'PHP',
    seats: 5,
    transmission: 'automatic',
    fuelType: 'gasoline',
    image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80',
    images: [],
    features: ['AC', 'Fuel Efficient', 'Compact'],
    available: true,
    rating: 4.6,
    reviewCount: 98,
  },
  {
    id: 'b1a2c3d4-e5f6-7890-abcd-200000000003',
    name: 'Toyota Innova',
    brand: 'Toyota',
    model: 'Innova',
    year: 2024,
    category: 'suv',
    pricePerDay: 2800,
    currency: 'PHP',
    seats: 8,
    transmission: 'automatic',
    fuelType: 'diesel',
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80',
    images: [],
    features: ['AC', 'Spacious', 'Family-friendly', 'USB Charging'],
    available: true,
    rating: 4.9,
    reviewCount: 187,
  },
  {
    id: 'b1a2c3d4-e5f6-7890-abcd-200000000004',
    name: 'Mitsubishi Xpander',
    brand: 'Mitsubishi',
    model: 'Xpander',
    year: 2024,
    category: 'suv',
    pricePerDay: 2600,
    currency: 'PHP',
    seats: 7,
    transmission: 'automatic',
    fuelType: 'gasoline',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80',
    images: [],
    features: ['AC', 'Bluetooth', 'Spacious', 'Modern Design'],
    available: true,
    rating: 4.8,
    reviewCount: 156,
  },
  {
    id: 'b1a2c3d4-e5f6-7890-abcd-200000000005',
    name: 'Mitsubishi Montero',
    brand: 'Mitsubishi',
    model: 'Montero Sport',
    year: 2024,
    category: 'suv',
    pricePerDay: 4000,
    currency: 'PHP',
    seats: 7,
    transmission: 'automatic',
    fuelType: 'diesel',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
    images: [],
    features: ['AC', 'Leather Seats', '4WD', 'Navigation'],
    available: true,
    rating: 4.9,
    reviewCount: 134,
  },
  {
    id: 'b1a2c3d4-e5f6-7890-abcd-200000000006',
    name: 'Toyota Fortuner',
    brand: 'Toyota',
    model: 'Fortuner',
    year: 2024,
    category: 'suv',
    pricePerDay: 4000,
    currency: 'PHP',
    seats: 7,
    transmission: 'automatic',
    fuelType: 'diesel',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80',
    images: [],
    features: ['AC', 'Leather Seats', '4WD', 'Navigation', 'Premium'],
    available: true,
    rating: 4.9,
    reviewCount: 167,
  },
  {
    id: 'b1a2c3d4-e5f6-7890-abcd-200000000007',
    name: 'Hi-Ace Van Manual',
    brand: 'Toyota',
    model: 'Hi-Ace Highroof',
    year: 2024,
    category: 'van',
    pricePerDay: 4000,
    currency: 'PHP',
    seats: 15,
    transmission: 'manual',
    fuelType: 'diesel',
    image: 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800&q=80',
    images: [],
    features: ['AC', 'Spacious', 'Perfect for Groups'],
    available: true,
    rating: 4.7,
    reviewCount: 112,
  },
  {
    id: 'b1a2c3d4-e5f6-7890-abcd-200000000008',
    name: 'Hi-Ace Van Automatic',
    brand: 'Toyota',
    model: 'Hi-Ace Highroof',
    year: 2024,
    category: 'van',
    pricePerDay: 5000,
    currency: 'PHP',
    seats: 15,
    transmission: 'automatic',
    fuelType: 'diesel',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80',
    images: [],
    features: ['AC', 'Spacious', 'Automatic', 'Perfect for Groups'],
    available: true,
    rating: 4.8,
    reviewCount: 98,
  },
  {
    id: 'b1a2c3d4-e5f6-7890-abcd-200000000009',
    name: 'GL Grandia',
    brand: 'Toyota',
    model: 'Grandia GL',
    year: 2024,
    category: 'van',
    pricePerDay: 5000,
    currency: 'PHP',
    seats: 12,
    transmission: 'automatic',
    fuelType: 'diesel',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
    images: [],
    features: ['AC', 'Premium Interior', 'Automatic', 'Captain Seats'],
    available: true,
    rating: 4.9,
    reviewCount: 145,
  },
  {
    id: 'b1a2c3d4-e5f6-7890-abcd-200000000010',
    name: 'Changan CS35',
    brand: 'Changan',
    model: 'CS35 Plus',
    year: 2024,
    category: 'suv',
    pricePerDay: 2300,
    currency: 'PHP',
    seats: 5,
    transmission: 'automatic',
    fuelType: 'gasoline',
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80',
    images: [],
    features: ['AC', 'Touchscreen', 'Modern Design', 'Fuel Efficient'],
    available: true,
    rating: 4.7,
    reviewCount: 67,
  },
];

interface FilterState {
  carTypes: string[];
  transmissions: string[];
  priceRange: { min: number; max: number };
}

/**
 * Search Form Component - Compact version
 */
const SearchForm: FC<{
  searchCriteria: { location: string; pickupDate: string; returnDate: string };
  onLocationClick: () => void;
  onSearchChange: (params: { location: string; pickupDate: string; returnDate: string }) => void;
  onSearch: () => void;
}> = ({ searchCriteria, onLocationClick, onSearchChange, onSearch }) => (
  <div className="bg-white border-b border-neutral-200">
    <div className="px-4 sm:px-6 lg:px-12 xl:px-[200px] py-4">
      <div className="flex flex-col lg:flex-row gap-3 items-stretch">
        {/* Location */}
        <div className="flex-1 w-full lg:w-auto">
          <button
            onClick={onLocationClick}
            className="w-full h-10 px-3 text-left border border-neutral-200 rounded-lg bg-white hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#E22B2B]/20 text-sm flex items-center gap-2"
          >
            <MapPin className="h-4 w-4 text-neutral-400" />
            <span className={`${searchCriteria.location ? 'text-neutral-900' : 'text-neutral-500'}`}>
              {searchCriteria.location || 'City, Airport, or Address'}
            </span>
          </button>
        </div>

        {/* Pickup Date */}
        <div className="flex-1 w-full lg:w-auto">
          <input
            type="date"
            value={searchCriteria.pickupDate}
            onChange={(e) => onSearchChange({ ...searchCriteria, pickupDate: e.target.value })}
            className="w-full h-10 px-3 border border-neutral-200 rounded-lg bg-white hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#E22B2B]/20 text-sm"
          />
        </div>

        {/* Return Date */}
        <div className="flex-1 w-full lg:w-auto">
          <input
            type="date"
            value={searchCriteria.returnDate}
            onChange={(e) => onSearchChange({ ...searchCriteria, returnDate: e.target.value })}
            className="w-full h-10 px-3 border border-neutral-200 rounded-lg bg-white hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#E22B2B]/20 text-sm"
          />
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
  const [isBookNowModalOpen, setIsBookNowModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  // Handle booking a car
  const handleBookNow = (car: Car) => {
    setSelectedCar(car);
    setIsBookNowModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsBookNowModalOpen(false);
    setSelectedCar(null);
  };

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
  };

  const handleLocationConfirm = (location: string) => {
    setSearchCriteria(prev => ({ ...prev, location }));
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
        onSearchChange={handleSearchChange}
        onSearch={handleSearch}
      />

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-12 xl:px-[200px] py-8">
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
              {visibleCars.map((car) => (
                <CarCard
                  key={car.id}
                  car={car}
                  onBookNow={handleBookNow}
                  showAvailability
                />
              ))}
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
      <BookNowModal
        isOpen={isBookNowModalOpen}
        onClose={handleCloseModal}
        selectedVehicle={selectedCar}
      />

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
        initialData={bookingData}
      />
    </div>
  );
};

export default BrowseVehiclesPage;
