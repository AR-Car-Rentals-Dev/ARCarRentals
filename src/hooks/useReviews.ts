import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';
import type { Testimonial } from '@/types';

export const useReviews = (limit = 10) => {
    const [reviews, setReviews] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const { data, error } = await supabase
                    .from('reviews')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(limit);

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

                    // Sort: Reviews with photos first, then by date
                    const sortedReviews = formattedReviews.sort((a, b) => {
                        // If a has avatar and b doesn't, a comes first (-1)
                        if (a.avatar && !b.avatar) return -1;
                        // If b has avatar and a doesn't, b comes first (1)
                        if (!a.avatar && b.avatar) return 1;
                        // Otherwise keep original order
                        return 0;
                    });

                    setReviews(sortedReviews);
                }
            } catch (err) {
                console.error('Unexpected error fetching reviews:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, [limit]);

    return { reviews, isLoading };
};

// Helper to generate deterministic color from string
export const stringToColor = (str: string) => {
    if (!str) return 'bg-gray-500';

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
