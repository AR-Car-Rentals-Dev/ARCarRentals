import { type FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { useBlogPosts } from '@hooks/useBlog';
import { SEO } from '@/components/SEO';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const BlogCardSkeleton: FC = () => (
    <div className="animate-pulse overflow-hidden rounded-2xl bg-white shadow-md">
        <div className="h-52 bg-gray-200" />
        <div className="p-6">
            <div className="mb-3 h-4 w-24 rounded bg-gray-200" />
            <div className="mb-2 h-6 w-3/4 rounded bg-gray-200" />
            <div className="mb-1 h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-2/3 rounded bg-gray-200" />
        </div>
    </div>
);

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export const BlogListPage: FC = () => {
    const { data: posts, isLoading, isError } = useBlogPosts();
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', 'Travel Tips', 'Rental Guides', 'Destinations', 'News'];

    const filteredPosts = posts?.filter(post => {
        const isPublished = post.isPublished;
        const matchesCategory = selectedCategory === 'All' || (post.categories && post.categories.includes(selectedCategory));
        return isPublished && matchesCategory;
    });

    return (
        <>
            <SEO
                title="Blog"
                description="Tips, guides, and stories about car rentals, tours, and travel in Cebu City, Philippines."
                keywords={['Cebu travel blog', 'car rental tips', 'Cebu tours guide']}
                canonical="https://arcarrentalscebu.com/blogs"
            />

            {/* Hero Banner */}
            <section className="relative overflow-hidden h-[340px] md:h-[400px]">
                {/* Background Image */}
                <img
                    src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80"
                    alt="Car travelling on scenic road"
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-black/55" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                {/* Hero Content — Centered */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
                    {/* Tag */}
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="inline-block text-[#FF6B6B] text-xs font-bold uppercase tracking-[0.25em] mb-4"
                    >
                        AR Car Rental Blog
                    </motion.span>

                    {/* Heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.05 }}
                        className="text-3xl md:text-5xl lg:text-[56px] font-extrabold text-white leading-[1.08] mb-4"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                        Stories & Guides
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-white/65 text-sm md:text-base max-w-lg leading-relaxed mb-8"
                    >
                        Travel tips, rental guides, and everything you need to explore Cebu like a local.
                    </motion.p>

                    {/* Category Pills — inside hero */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-wrap justify-center gap-2"
                    >
                        {categories.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setSelectedCategory(tag)}
                                className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 backdrop-blur-sm ${selectedCategory === tag
                                    ? 'bg-white text-neutral-900 shadow-xl scale-105'
                                    : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105 border border-white/10'
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Posts Grid */}
            <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
                {isLoading && (
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <BlogCardSkeleton key={i} />
                        ))}
                    </div>
                )}

                {isError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
                        <p className="text-red-700">Failed to load blog posts. Please try again later.</p>
                    </div>
                )}

                {filteredPosts && filteredPosts.length === 0 && !isLoading && !isError && (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-12 text-center">
                        <p className="text-lg text-gray-500">No blog posts found for <span className="font-bold">"{selectedCategory}"</span>.</p>
                        <button
                            onClick={() => setSelectedCategory('All')}
                            className="mt-4 text-sm font-bold text-red-600 hover:underline"
                        >
                            View All Posts
                        </button>
                    </div>
                )}

                {filteredPosts && filteredPosts.length > 0 && (
                    <motion.div
                        layout
                        className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
                    >
                        <AnimatePresence mode='popLayout'>
                            {filteredPosts.map((post) => (
                                <motion.article
                                    layout
                                    key={post.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Link
                                        to={`/blogs/${post.slug.current}`}
                                        className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-shadow hover:shadow-xl"
                                    >
                                        {/* Image */}
                                        <div className="relative h-52 overflow-hidden bg-gray-100">
                                            {post.mainImage ? (
                                                <img
                                                    src={post.mainImage}
                                                    alt={post.title}
                                                    loading="lazy"
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
                                                    <span className="text-4xl text-red-300">📝</span>
                                                </div>
                                            )}
                                            {/* Category Badge on Image */}
                                            {post.categories && post.categories.length > 0 && (
                                                <div className="absolute top-3 left-3">
                                                    <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-neutral-900 shadow-sm">
                                                        {post.categories[0]}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex flex-1 flex-col p-6">
                                            {/* Date & Categories */}
                                            <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={13} />
                                                    {formatDate(post.publishedAt)}
                                                </span>
                                            </div>

                                            <h2 className="mb-2 text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors">
                                                {post.title}
                                            </h2>

                                            {post.excerpt && (
                                                <p className="mb-4 flex-1 text-sm text-gray-600 line-clamp-3">
                                                    {post.excerpt}
                                                </p>
                                            )}

                                            <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-red-600 transition-transform group-hover:translate-x-1">
                                                Read More <ArrowRight size={14} />
                                            </span>
                                        </div>
                                    </Link>
                                </motion.article>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </section>
        </>
    );
};

export default BlogListPage;
