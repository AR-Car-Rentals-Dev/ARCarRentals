import type { FC } from 'react';

interface Tour {
  id: string;
  name: string;
  description: string;
  image: string;
}

const popularTours: Tour[] = [
  {
    id: '1',
    name: 'Bohol Countryside Tour',
    description: 'Experience the Chocolate Hills, Tarsier Sanctuary, and Loboc River Cruise in one amazing day.',
    image: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=600&q=80',
  },
  {
    id: '2',
    name: 'Cebu City Heritage Tour',
    description: "Visit Magellan's Cross, Sto. Niño Basilica, and Fort San Pedro. A journey through history.",
    image: 'https://images.unsplash.com/photo-1570789210967-2cac24db9c9e?w=600&q=80',
  },
];

/**
 * Popular Tours section
 */
export const PopularToursSection: FC = () => {
  return (
    <section 
      className="bg-white flex flex-col justify-center py-10 sm:py-16"
      style={{ 
        minHeight: '400px',
        fontFamily: "'Plus Jakarta Sans', sans-serif" 
      }}
    >
      <div className="mx-auto w-full max-w-[1600px]" style={{ paddingInline: 'clamp(1.5rem, 3vw, 3rem)' }}>
        {/* Section Header */}
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-6 sm:mb-8">
          Popular Tours
        </h2>

        {/* Tours Grid - 2 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {popularTours.map((tour) => (
            <div 
              key={tour.id} 
              className="relative h-[220px] sm:h-[280px] rounded-xl overflow-hidden group"
            >
              {/* Background Image */}
              <img
                src={tour.image}
                alt={tour.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                <h3 className="font-bold text-base sm:text-lg mb-1">
                  {tour.name}
                </h3>
                <p className="text-white/80 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                  {tour.description}
                </p>
                <button className="px-3 sm:px-4 py-2 bg-neutral-800/80 hover:bg-neutral-800 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors">
                  Book Tour
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularToursSection;
