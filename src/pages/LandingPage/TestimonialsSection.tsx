import { type FC, useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Rating } from '@/components/ui';
import type { Testimonial } from '@/types';

// Extended testimonial data with time posted and avatar URLs
const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Mark Santos',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    comment:
      'Excellent service! The car was brand new and the transaction was seamless. Highly recommended to anyone visiting Cebu.',
    location: '2 days ago',
    verified: true,
  },
  {
    id: '2',
    name: 'Emily Clarke',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    comment:
      'We booked the Bohol tour package and it was amazing. The driver was very professional and knew all the best spots!',
    location: '1 week ago',
    verified: true,
  },
  {
    id: '3',
    name: 'John D.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    comment:
      'Best rates in Cebu City. The SUV was clean and powerful enough for our mountain trip. Will definitely book again.',
    location: '1 month ago',
    verified: true,
  },
  {
    id: '4',
    name: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    comment:
      'Amazing experience! The team was very accommodating and the car was in perfect condition. Highly recommended!',
    location: '2 weeks ago',
    verified: true,
  },
  {
    id: '5',
    name: 'David Lee',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    rating: 5,
    comment:
      'Great service and very affordable rates. The booking process was smooth and hassle-free.',
    location: '3 days ago',
    verified: true,
  },
];

/**
 * Testimonials section with customer reviews carousel
 */
export const TestimonialsSection: FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Responsive cards to show
  const getCardsToShow = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) return 1;
      if (window.innerWidth < 1024) return 2;
      return 3;
    }
    return 3;
  };
  
  const [cardsToShow, setCardsToShow] = useState(getCardsToShow());
  const maxIndex = Math.max(0, testimonials.length - cardsToShow);

  // Update cards to show on resize
  useState(() => {
    const handleResize = () => setCardsToShow(getCardsToShow());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + cardsToShow);

  return (
    <section 
      className="bg-[#F0F0F0]"
      style={{ 
        minHeight: '400px',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div className="h-full mx-auto w-full max-w-[1600px] py-8 sm:py-12 flex flex-col" style={{ paddingInline: 'clamp(1.5rem, 3vw, 3rem)' }}>
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-1">
              Trusted by 500+ Travelers
            </h2>
            <div className="flex items-center gap-2">
              <Rating value={4.9} showValue />
              <span className="text-sm text-neutral-500">4.9/5 Rating on Google</span>
            </div>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`p-2 rounded-full border transition-all ${
                currentIndex === 0
                  ? 'border-neutral-300 text-neutral-300 cursor-not-allowed'
                  : 'border-neutral-400 text-neutral-600 hover:bg-white hover:border-neutral-500'
              }`}
              aria-label="Previous testimonials"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              className={`p-2 rounded-full transition-all ${
                currentIndex >= maxIndex
                  ? 'bg-neutral-400 text-neutral-200 cursor-not-allowed'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800'
              }`}
              aria-label="Next testimonials"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Testimonials Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 flex-1">
          {visibleTestimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl p-4 sm:p-6 flex flex-col"
            >
              {/* User Info */}
              <div className="flex items-center gap-3 mb-1">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-semibold text-neutral-900 text-sm">
                      {testimonial.name}
                    </h4>
                    {testimonial.verified && (
                      <CheckCircle2 className="h-4 w-4 text-blue-500 fill-blue-500" />
                    )}
                  </div>
                  <p className="text-xs text-neutral-400">{testimonial.location}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-4">
                <Rating value={testimonial.rating} size="sm" />
              </div>

              {/* Comment */}
              <p className="text-neutral-600 text-sm leading-relaxed">
                "{testimonial.comment}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
