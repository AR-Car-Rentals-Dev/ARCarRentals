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
      className="bg-white rounded-[16px] border border-[#ededf2] shadow-sm hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full w-full"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Header: Name + Category Badge */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-lg text-[#1f1f1f] leading-tight">
            {car.name}
          </h3>
          <span className="px-2.5 py-1 text-xs font-semibold text-[#6b7280] bg-[#f3f4f6] rounded-full capitalize flex-shrink-0 whitespace-nowrap">
            {car.category}
          </span>
        </div>
      </div>

      {/* Car Image with Availability Badge Inside */}
      <div className="px-5 py-2">
        <div className="bg-[#fafafa] rounded-xl overflow-hidden relative" style={{ height: '160px' }}>
          {/* Availability Badge - Inside Image */}
          {showAvailability && (
            <span className={`absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white rounded-full ${statusConfig.bg} z-10 uppercase tracking-wide`}>
              {statusConfig.text}
            </span>
          )}
          <img
            src={car.image}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>

      {/* Specs Row */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-around text-[#6b7280]">
          <div className="flex flex-col items-center gap-1.5">
            <Settings2 className="h-4 w-4" strokeWidth={2} />
            <span className="text-xs capitalize font-medium">{car.transmission}</span>
          </div>
          <div className="h-8 w-px bg-[#eaeaf0]"></div>
          <div className="flex flex-col items-center gap-1.5">
            <Users className="h-4 w-4" strokeWidth={2} />
            <span className="text-xs font-medium">{car.seats} Seats</span>
          </div>
          <div className="h-8 w-px bg-[#eaeaf0]"></div>
          <div className="flex flex-col items-center gap-1.5">
            <Fuel className="h-4 w-4" strokeWidth={2} />
            <span className="text-xs capitalize font-medium">{car.fuelType}</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-[#eaeaf0]" />

      {/* Price & Book Now - Push to bottom */}
      <div className="px-5 py-4 flex items-center justify-between mt-auto gap-3">
        <div className="flex flex-col flex-shrink-0">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-[#e53935] leading-none">
              ₱{car.pricePerDay.toLocaleString()}
            </span>
          </div>
          <span className="text-[#6b7280] text-xs font-medium">/day</span>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => onBookNow(car)}
          className="bg-[#e53935] hover:bg-[#c62828] border-none rounded-[12px] px-6 py-2.5 text-sm font-semibold flex-shrink-0 shadow-sm transition-all whitespace-nowrap"
        >
          Book Now
        </Button>
      </div>
    </div>
  );
};

export default CarCard;
