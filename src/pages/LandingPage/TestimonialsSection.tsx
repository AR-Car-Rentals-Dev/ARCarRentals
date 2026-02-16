import { type FC, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Rating } from '@/components/ui';
import type { Testimonial } from '@/types';
import { supabase } from '@/services/supabase';

// Helper to generate deterministic color from string
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500',
    'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
    'bg-cyan-500', 'bg-blue-500', 'bg-indigo-500',
    'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500',
    'bg-pink-500', 'bg-rose-500'
  ];
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Testimonials section with customer reviews carousel
 */
export const TestimonialsSection: FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching reviews:', error);
          return;
        }

        if (data) {
          const formattedReviews: Testimonial[] = data.map((review) => ({
            id: review.id,
            name: review.name,
            avatar: review.photo_url || '',
            rating: review.rating,
            comment: review.comment,
            location: review.is_verified ? 'Verified Customer' : '',
            verified: review.is_verified,
            reviewUrl: review.review_url,
          }));

          // Sort: Reviews with photos first, then by date (which is already implicit from DB order, but we preserve it)
          const sortedReviews = formattedReviews.sort((a, b) => {
            // If a has avatar and b doesn't, a comes first (-1)
            if (a.avatar && !b.avatar) return -1;
            // If b has avatar and a doesn't, b comes first (1)
            if (!a.avatar && b.avatar) return 1;
            // Otherwise keep original order (by date)
            return 0;
          });

          setTestimonials(sortedReviews.slice(0, 10)); // Limit to top 10 after sorting
        }
      } catch (err) {
        console.error('Unexpected error fetching reviews:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

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
  useEffect(() => {
    const handleResize = () => setCardsToShow(getCardsToShow());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + cardsToShow);

  return (
    <section
      className="bg-white"
      style={{
        minHeight: '400px',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div className="h-full mx-auto w-full max-w-[1600px] py-10 sm:py-12 flex flex-col" style={{ paddingInline: 'clamp(1.5rem, 3vw, 3rem)' }}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4"
        >
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-1">
              Trusted by 500+ Travelers
            </h2>
            <div className="flex items-center gap-2">
              <Rating value={4.9} showValue />
              <span className="text-sm text-neutral-500">4.9/5 Rating on Google</span>
            </div>
          </div>

          {/* Navigation Arrows - Only show if we have reviews and not loading */}
          {!isLoading && testimonials.length > cardsToShow && (
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`p-2 rounded-full border transition-all ${currentIndex === 0
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
                className={`p-2 rounded-full transition-all ${currentIndex >= maxIndex
                  ? 'bg-neutral-400 text-neutral-200 cursor-not-allowed'
                  : 'bg-neutral-900 text-white hover:bg-neutral-800'
                  }`}
                aria-label="Next testimonials"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </motion.div>

        {/* Testimonials Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 flex-1"
        >
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: cardsToShow }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-6 flex flex-col h-full animate-pulse shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                    <div className="h-3 w-16 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="h-4 w-20 bg-gray-200 rounded mb-4" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-200 rounded" />
                  <div className="h-3 w-3/4 bg-gray-200 rounded" />
                </div>
              </div>
            ))
          ) : testimonials.length > 0 ? (
            visibleTestimonials.map((testimonial) => {
              const bgColor = stringToColor(testimonial.name);
              const CardContent = (
                <>
                  {/* User Info */}
                  <div className="flex items-center gap-3 mb-1">
                    {testimonial.avatar ? (
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center text-white font-semibold text-sm shadow-sm`}>
                        {testimonial.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-semibold text-neutral-900 text-sm">
                          {testimonial.name}
                        </h4>
                        {testimonial.verified && (
                          <CheckCircle2 className="h-4 w-4 text-blue-500 fill-blue-500" />
                        )}
                      </div>
                      {testimonial.location && (
                        <p className="text-xs text-neutral-400">{testimonial.location}</p>
                      )}
                    </div>
                    {testimonial.reviewUrl && (
                      <ExternalLink className="w-4 h-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>

                  {/* Rating */}
                  <div className="mb-4">
                    <Rating value={testimonial.rating} size="sm" />
                  </div>

                  {/* Comment */}
                  <p className="text-neutral-600 text-sm leading-relaxed line-clamp-4">
                    "{testimonial.comment}"
                  </p>
                </>
              );

              if (testimonial.reviewUrl) {
                return (
                  <a
                    key={testimonial.id}
                    href={testimonial.reviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl p-4 sm:p-6 flex flex-col hover:border-blue-200 hover:shadow-md transition-all cursor-pointer block h-full"
                  >
                    {CardContent}
                  </a>
                );
              }

              return (
                <div
                  key={testimonial.id}
                  className="bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl p-4 sm:p-6 flex flex-col h-full"
                >
                  {CardContent}
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500">
              No reviews available yet.
            </div>
          )}
        </motion.div>
      </div>
    </section >
  );
};

export default TestimonialsSection;
