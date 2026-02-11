import { type FC, useState, useEffect } from 'react';
import { useReviews, stringToColor } from '@/hooks/useReviews';
import { Rating } from '@/components/ui';
import { CheckCircle2, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

export const AboutUsReviewsSection: FC = () => {
    const { reviews, isLoading } = useReviews(10);
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
    const maxIndex = Math.max(0, reviews.length - cardsToShow);

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

    const visibleReviews = reviews.slice(currentIndex, currentIndex + cardsToShow);

    return (
        <section className="py-20 px-4 md:px-8 bg-white relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-[#E22B2B]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#E22B2B]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

            <div className="max-w-[1600px] mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col items-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 mb-4 text-center">
                        What Our Customers Say
                    </h2>
                    {/* Decorative Underline */}
                    <div className="w-24 h-1 bg-[#E22B2B] rounded-full mb-4"></div>
                    <p className="text-gray-500 max-w-2xl text-lg text-center mb-8">
                        Trusted by thousands of travelers worldwide for their journeys.
                    </p>

                    {/* Navigation Arrows */}
                    {!isLoading && reviews.length > cardsToShow && (
                        <div className="flex items-center gap-3 mt-4">
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
                </div>

                {/* Carousel Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pb-4">
                    {isLoading ? (
                        // Loading skeletons
                        Array.from({ length: cardsToShow }).map((_, i) => (
                            <div key={i} className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 flex flex-col h-full animate-pulse">
                                <div className="flex text-gray-200 mb-6 gap-1">
                                    {[...Array(5)].map((_, j) => <div key={j} className="w-5 h-5 bg-gray-200 rounded-full" />)}
                                </div>
                                <div className="flex-grow space-y-2 mb-8">
                                    <div className="h-4 bg-gray-200 rounded w-full" />
                                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                                    <div className="h-4 bg-gray-200 rounded w-4/6" />
                                </div>
                                <div className="flex items-center gap-4 mt-auto border-t border-gray-100 pt-6">
                                    <div className="w-12 h-12 rounded-full bg-gray-200" />
                                    <div>
                                        <div className="h-4 w-24 bg-gray-200 rounded mb-1" />
                                        <div className="h-3 w-32 bg-gray-200 rounded" />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : reviews.length > 0 ? (
                        visibleReviews.map((review) => {
                            const bgColor = stringToColor(review.name);

                            const CardContent = (
                                <>
                                    {/* Rating */}
                                    <div className="mb-6">
                                        <Rating value={review.rating} />
                                    </div>

                                    {/* Quote */}
                                    <p className="text-gray-600 mb-8 flex-grow leading-relaxed italic relative">
                                        <span className="absolute -top-4 -left-2 text-6xl text-[#E22B2B]/10 font-serif leading-none">"</span>
                                        {review.comment}
                                    </p>

                                    {/* User Info */}
                                    <div className="flex items-center gap-4 mt-auto border-t border-gray-100 pt-6">
                                        <div className="relative">
                                            {review.avatar ? (
                                                <img
                                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-[#E22B2B]/20"
                                                    src={review.avatar}
                                                    alt={`Portrait of ${review.name}`}
                                                />
                                            ) : (
                                                <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center text-white font-bold text-lg shadow-sm ring-2 ring-[#E22B2B]/20`}>
                                                    {(review.name || '?').charAt(0)}
                                                </div>
                                            )}
                                            {review.verified && (
                                                <div className="absolute -bottom-1 -right-1 bg-[#E22B2B] text-white rounded-full p-0.5">
                                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-neutral-900 text-sm">{review.name}</h4>
                                                {review.reviewUrl && <ExternalLink className="w-3 h-3 text-gray-400" />}
                                            </div>
                                            <p className="text-[#E22B2B] text-xs font-semibold mt-0.5 uppercase tracking-wide">
                                                {review.location || 'Verified Customer'}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            );

                            if (review.reviewUrl) {
                                return (
                                    <a
                                        key={review.id}
                                        href={review.reviewUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-white rounded-xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col h-full cursor-pointer group"
                                    >
                                        {CardContent}
                                    </a>
                                );
                            }

                            return (
                                <div
                                    key={review.id}
                                    className="bg-white rounded-xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col h-full"
                                >
                                    {CardContent}
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No reviews available yet.
                        </div>
                    )}
                </div>

                {/* Trust Badges */}
                <div className="mt-16 pt-8 border-t border-gray-200 flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="flex items-center gap-2">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                        </svg>
                        <span className="font-bold text-lg">TripAdvisor</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                        <span className="font-bold text-lg">Trustpilot</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                        </svg>
                        <span className="font-bold text-lg">Google Reviews</span>
                    </div>
                </div>
            </div>
        </section>
    );
};
