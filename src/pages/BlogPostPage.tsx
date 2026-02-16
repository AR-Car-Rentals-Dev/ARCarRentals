import type { FC } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ArrowLeft, User } from 'lucide-react';
import { useBlogPost } from '@hooks/useBlog';
import { SEO } from '@/components/SEO';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const PostSkeleton: FC = () => (
    <div className="animate-pulse">
        <div className="mx-auto mb-8 h-8 w-3/4 rounded bg-gray-200" />
        <div className="mx-auto mb-12 h-80 w-full rounded-2xl bg-gray-200" />
        <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-4 rounded bg-gray-200" style={{ width: `${85 + Math.random() * 15}%` }} />
            ))}
        </div>
    </div>
);

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export const BlogPostPage: FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { data: post, isLoading, isError } = useBlogPost(slug!); // slug! because route ensures it

    // Build OG image URL
    const ogImageUrl = post?.mainImage || undefined;

    // Use metaTitle/metaDescription with fallbacks (mock data simplified)
    const pageTitle = post?.title || 'Blog Post';
    const pageDescription = post?.excerpt || '';

    return (
        <>
            <SEO
                title={pageTitle}
                description={pageDescription}
                ogType="article"
                ogImage={ogImageUrl || undefined}
                canonical={`https://arcarrentalscebu.com/blogs/${post?.slug?.current || ''}`}
                articlePublishedTime={post?.publishedAt || undefined}
                author={post?.author || undefined}
            />

            {/* Back link */}
            <div className="mx-auto max-w-4xl px-4 pt-8">
                <Link
                    to="/blogs"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-red-600"
                >
                    <ArrowLeft size={16} />
                    Back to Blog
                </Link>
            </div>

            <article className="mx-auto max-w-4xl px-4 py-8 md:py-12">
                {/* Loading */}
                {isLoading && <PostSkeleton />}

                {/* Error */}
                {isError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
                        <p className="text-red-700">Failed to load blog post. Please try again later.</p>
                    </div>
                )}

                {/* Not found */}
                {!isLoading && !isError && !post && (
                    <div className="py-20 text-center">
                        <h2 className="mb-4 text-2xl font-bold text-gray-900">Post Not Found</h2>
                        <p className="mb-8 text-gray-500">The article you're looking for doesn't exist or has been removed.</p>
                        <Link
                            to="/blogs"
                            className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                        >
                            <ArrowLeft size={16} />
                            Back to Blog
                        </Link>
                    </div>
                )}

                {/* Post content */}
                {post && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                        {/* Title */}
                        <h1
                            className="mb-6 text-3xl font-extrabold tracking-tight text-gray-900 md:text-4xl lg:text-5xl"
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                            {post.title}
                        </h1>

                        {/* Meta row */}
                        <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            {post.author && (
                                <span className="flex items-center gap-1.5">
                                    <User size={14} />
                                    {post.author}
                                </span>
                            )}
                            {post.publishedAt && (
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    {formatDate(post.publishedAt)}
                                </span>
                            )}
                        </div>

                        {/* Hero image */}
                        {post.mainImage && (
                            <div className="mb-10 overflow-hidden rounded-2xl shadow-lg">
                                <img
                                    src={post.mainImage}
                                    alt={post.title}
                                    className="w-full object-cover"
                                />
                            </div>
                        )}

                        {/* Body (HTML Rendered directly for mock) */}
                        <div
                            className="prose-custom prose prose-lg prose-red mx-auto max-w-none hover:prose-a:text-red-600"
                            dangerouslySetInnerHTML={{ __html: post.body }}
                        />

                        {/* Bottom CTA */}
                        <div className="mt-16 border-t border-gray-200 pt-8 text-center">
                            <p className="mb-4 text-gray-600">Enjoyed this article?</p>
                            <Link
                                to="/blogs"
                                className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                            >
                                <ArrowLeft size={16} />
                                Read More Articles
                            </Link>
                        </div>
                    </motion.div>
                )}
            </article>
        </>
    );
};

export default BlogPostPage;
