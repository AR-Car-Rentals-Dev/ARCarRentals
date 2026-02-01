import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Users, Fuel, Settings2, ArrowRight } from 'lucide-react';
import { Container, Card, Badge, Button } from '@components/ui';
import { formatCurrency } from '@utils/helpers';
import type { Car } from '@/types';

// Top 6 most popular rental cars in the Philippines (based on client's fleet)
// Ranked by popularity: Innova, Fortuner, Xpander, Vios, GL Grandia, Montero
const featuredCars: Car[] = [
  {
    id: 'f1a2b3c4-d5e6-7890-abcd-100000000001',
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
    id: 'f1a2b3c4-d5e6-7890-abcd-100000000002',
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
    id: 'f1a2b3c4-d5e6-7890-abcd-100000000003',
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
    id: 'f1a2b3c4-d5e6-7890-abcd-100000000004',
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
    id: 'f1a2b3c4-d5e6-7890-abcd-100000000005',
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
    id: 'f1a2b3c4-d5e6-7890-abcd-100000000006',
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

interface CarCardProps {
  car: Car;
}

/**
 * Individual car card component
 */
const CarCard: FC<CarCardProps> = ({ car }) => {
  const badgeVariant = car.category as 'economy' | 'suv' | 'van' | 'luxury';

  return (
    <Card className="overflow-hidden group" hoverable>
      {/* Car Image */}
      <div className="relative h-48 bg-neutral-100 overflow-hidden">
        <img
          src={car.image}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <Badge
          variant={badgeVariant}
          className="absolute top-3 right-3"
        >
          {car.category}
        </Badge>
      </div>

      {/* Car Info */}
      <div className="p-5">
        <h3 className="font-semibold text-lg text-neutral-900 mb-3">
          {car.name}
        </h3>

        {/* Specs */}
        <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>{car.seats} Seats</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Settings2 className="h-4 w-4" />
            <span className="capitalize">{car.transmission}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Fuel className="h-4 w-4" />
            <span className="capitalize">{car.fuelType}</span>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
          <div>
            <span className="text-2xl font-bold text-neutral-900">
              {formatCurrency(car.pricePerDay, car.currency)}
            </span>
            <span className="text-neutral-500 text-sm">/day</span>
          </div>
          <Link
            to={`/cars/${car.id}`}
            className="text-primary-600 font-medium text-sm hover:text-primary-700 transition-colors inline-flex items-center gap-1"
          >
            View Details
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </Card>
  );
};

/**
 * Featured Fleet section
 */
export const FeaturedFleetSection: FC = () => {
  return (
    <section className="py-16 lg:py-24 bg-neutral-50">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">
              Featured Fleet
            </h2>
            <p className="text-neutral-500">
              Choose from our wide range of well-maintained vehicles.
            </p>
          </div>
          <Link
            to="/fleet"
            className="text-primary-600 font-medium hover:text-primary-700 transition-colors inline-flex items-center gap-1"
          >
            View All Cars
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Cars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Browse All Vehicles
          </Button>
        </div>
      </Container>
    </section>
  );
};

export default FeaturedFleetSection;
