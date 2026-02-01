import type { FC } from 'react';
import { Users, Fuel, Settings2 } from 'lucide-react';
import { Button } from './Button';
import type { Car } from '@/types';

type AvailabilityStatus = 'available' | 'left' | 'reserved' | 'booked';

interface CarCardProps {
  car: Car;
  onBookNow: (car: Car) => void;
  showAvailability?: boolean;
  availabilityStatus?: AvailabilityStatus;
  leftCount?: number;
}

const getStatusConfig = (status: AvailabilityStatus, leftCount?: number) => {
  switch (status) {
    case 'available':
      return {
        bg: 'bg-[#22C55E]',
        text: 'AVAILABLE',
        icon: '●',
      };
    case 'left':
      return {
        bg: 'bg-[#F97316]',
        text: `${leftCount || 1} LEFT`,
        icon: '●',
      };
    case 'reserved':
      return {
        bg: 'bg-[#EAB308]',
        text: 'RESERVED',
        icon: '●',
      };
    case 'booked':
      return {
        bg: 'bg-[#EF4444]',
        text: 'BOOKED',
        icon: '●',
      };
    default:
      return {
        bg: 'bg-[#22C55E]',
        text: 'AVAILABLE',
        icon: '●',
      };
  }
};

/**
 * Reusable car card component matching Figma design
 */
export const CarCard: FC<CarCardProps> = ({ 
  car, 
  onBookNow, 
  showAvailability = false,
  availabilityStatus = 'available',
  leftCount,
}) => {
  const statusConfig = getStatusConfig(availabilityStatus, leftCount);

  return (
    <div 
      className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col h-full min-w-[280px]"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Header: Name + Category Badge */}
      <div className="px-5 pt-5 pb-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-bold text-lg text-neutral-900 leading-tight">
            {car.name}
          </h3>
          <span className="px-3 py-1 text-xs font-medium text-neutral-600 bg-neutral-100 rounded-full capitalize flex-shrink-0">
            {car.category}
          </span>
        </div>
      </div>

      {/* Car Image with Availability Badge Inside */}
      <div className="px-5 py-2">
        <div className="bg-neutral-50 rounded-lg overflow-hidden relative">
          {/* Availability Badge - Inside Image */}
          {showAvailability && (
            <span className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-full ${statusConfig.bg} z-10`}>
              {statusConfig.icon} {statusConfig.text}
            </span>
          )}
          <img
            src={car.image}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-44 object-cover"
            loading="lazy"
          />
        </div>
      </div>

      {/* Specs Row */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-around text-neutral-500">
          <div className="flex flex-col items-center gap-1.5">
            <Settings2 className="h-5 w-5" />
            <span className="text-xs capitalize">{car.transmission}</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Users className="h-5 w-5" />
            <span className="text-xs">{car.seats} Seats</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Fuel className="h-5 w-5" />
            <span className="text-xs capitalize">{car.fuelType}</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-neutral-200" />

      {/* Price & Book Now - Push to bottom */}
      <div className="px-5 py-5 flex items-center justify-between mt-auto gap-4">
        <div className="flex-shrink-0">
          <span className="text-2xl font-bold text-[#E22B2B]">
            ₱{car.pricePerDay.toLocaleString()}
          </span>
          <span className="text-neutral-400 text-sm">/day</span>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onBookNow(car)}
          className="bg-[#E22B2B] hover:bg-[#c92525] border-none rounded-lg px-5 py-2.5 text-sm font-medium flex-shrink-0"
        >
          Book Now
        </Button>
      </div>
    </div>
  );
};

export default CarCard;
