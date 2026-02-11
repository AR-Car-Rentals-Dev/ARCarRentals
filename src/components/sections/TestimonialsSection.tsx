import { type FC, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Container, Card, Avatar, Rating } from '@components/ui';
import type { Testimonial } from '@/types';
import { supabase } from '@services/supabase';

/**
 * Testimonials section with customer reviews
 */
export const TestimonialsSection: FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6); // Limit to recent 6 reviews

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
            location: '', // We don't have location in reviews table yet, optional
            verified: review.is_verified,
          }));
          setTestimonials(formattedReviews);
        }
      } catch (err) {
        console.error('Unexpected error fetching reviews:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  return (
    <section className="py-16 lg:py-24 bg-white">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">
              Trusted by 500+ Travelers
            </h2>
            <div className="flex items-center gap-2">
              <Rating value={4.9} showValue />
              <span className="text-sm text-neutral-500">4.9/5 Rating on Google</span>
            </div>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-full border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-all"
              aria-label="Previous testimonials"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              className="p-2 rounded-full bg-neutral-900 text-white hover:bg-neutral-800 transition-all"
              aria-label="Next testimonials"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-neutral-100 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-neutral-100 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-4 w-20 bg-neutral-100 rounded animate-pulse mb-4" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-neutral-100 rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-neutral-100 rounded animate-pulse" />
                </div>
              </Card>
            ))
          ) : testimonials.length > 0 ? (
            testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="p-6" hoverable>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar name={testimonial.name} src={testimonial.avatar} size="lg" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-neutral-900">
                        {testimonial.name}
                      </h4>
                      {testimonial.verified && (
                        <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
                      )}
                    </div>
                    {testimonial.location && (
                      <p className="text-sm text-neutral-500">{testimonial.location}</p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <Rating value={testimonial.rating} />
                </div>

                <p className="text-neutral-600 text-sm leading-relaxed">
                  "{testimonial.comment}"
                </p>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-neutral-500">
              No reviews yet. Be the first to review!
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};


export default TestimonialsSection;
