import { useQuery } from '@tanstack/react-query';
import { getAllPosts, getPostBySlug } from '@services/blogService';
import type { BlogPostSummary, BlogPost } from '@services/blogService';

/**
 * Fetch all blog posts (summary list)
 * Cached for 5 minutes via staleTime to avoid unnecessary refetches.
 */
export const useBlogPosts = () => {
    return useQuery<BlogPostSummary[]>({
        queryKey: ['blogPosts'],
        queryFn: getAllPosts,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

/**
 * Fetch a single blog post by slug
 * Only runs when a slug is provided (enabled guard).
 */
export const useBlogPost = (slug: string | undefined) => {
    return useQuery<BlogPost | null>({
        queryKey: ['blogPost', slug],
        queryFn: () => getPostBySlug(slug!),
        enabled: Boolean(slug),
        staleTime: 5 * 60 * 1000,
    });
};
