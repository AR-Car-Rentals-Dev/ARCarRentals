import { type FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BookNowModal, CarCard } from '@/components/ui';
import type { Car } from '@/types';

// Top 6 most popular rental cars in the Philippines (based on client's fleet)
// Ranked by popularity: Innova, Fortuner, Xpander, Vios, GL Grandia, Montero
const featuredCars: Car[] = [
  {
    id: '1',
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
    id: '2',
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
    id: '3',
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
    id: '4',
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
    id: '5',
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
    id: '6',
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
];

/**
 * Featured Fleet section
 */
export const FeaturedFleetSection: FC = () => {
  const [isBookNowModalOpen, setIsBookNowModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  const handleBookNow = (car: Car) => {
    setSelectedCar(car);
    setIsBookNowModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsBookNowModalOpen(false);
    setSelectedCar(null);
  };

  return (
    <section 
      className="bg-white py-10 sm:py-16"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="mx-auto w-full max-w-[1600px]" style={{ paddingInline: 'clamp(1.5rem, 3vw, 3rem)' }}>
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-10 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2">
              Featured Fleet
            </h2>
            <p className="text-neutral-500 text-sm sm:text-base">
              Choose from our wide range of well-maintained vehicles.
            </p>
          </div>
          <Link
            to="/browsevehicles"
            className="text-[#E22B2B] font-medium hover:text-[#c92525] transition-colors inline-flex items-center gap-1"
          >
            View All Cars
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Cars Grid - responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {featuredCars.map((car) => (
            <CarCard 
              key={car.id} 
              car={car} 
              onBookNow={handleBookNow}
            />
          ))}
        </div>
      </div>

      {/* Book Now Modal */}
      <BookNowModal
        isOpen={isBookNowModalOpen}
        onClose={handleCloseModal}
        selectedVehicle={selectedCar}
      />
    </section>
  );
};

export default FeaturedFleetSection;
