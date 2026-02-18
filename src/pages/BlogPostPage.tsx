import { type FC, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ArrowLeft, User, ChevronRight, Clock } from 'lucide-react';
import { useBlogPost } from '@hooks/useBlog';
import { getAllPosts, type BlogPost } from '@services/blogService';
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

const READING_TIME_WPM = 200;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const PostSkeleton: FC = () => (
    <div className="animate-pulse max-w-4xl mx-auto px-4 py-8">
        <div className="h-96 w-full rounded-2xl bg-gray-200 mb-8" />
        <div className="h-10 w-3/4 rounded bg-gray-200 mb-4 mx-auto" />
        <div className="space-y-4 max-w-2xl mx-auto">
            {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-4 rounded bg-gray-200" style={{ width: `${85 + Math.random() * 15}%` }} />
            ))}
        </div>
    </div>
);

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export const BlogPostPage: FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { data: post, isLoading, isError } = useBlogPost(slug!);

    // Carousel State
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    // Up Next State
    const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

    // Derived Data
    const headerImages = post?.headerImages && post.headerImages.length > 0
        ? post.headerImages
        : (post?.mainImage ? [post.mainImage] : []);

    const hasMultipleImages = headerImages.length > 1;

    // Carousel Timer
    useEffect(() => {
        if (!hasMultipleImages) return;

        const duration = 5000; // 5 seconds per slide
        const interval = 50; // Update progress every 50ms

        let timer = 0;

        const intervalId = setInterval(() => {
            timer += interval;
            const newProgress = (timer / duration) * 100;

            if (newProgress >= 100) {
                setCurrentImageIndex((prev) => (prev + 1) % headerImages.length);
                timer = 0;
                setProgress(0);
            } else {
                setProgress(newProgress);
            }
        }, interval);

        return () => clearInterval(intervalId);
    }, [hasMultipleImages, headerImages.length, currentImageIndex]); // Reset timer on index change logic handled inside

    // Fetch Related Posts
    useEffect(() => {
        if (post) {
            getAllPosts().then(posts => {
                const others = posts
                    .filter(p => p.id !== post.id && p.isPublished)
                    .slice(0, 3);
                setRelatedPosts(others);
            });
        }
    }, [post]);

    // calculate reading time
    const readingTime = post ? Math.max(1, Math.ceil(post.body.replace(/(<([^>]+)>)/gi, "").split(/\s+/).length / READING_TIME_WPM)) : 1;

    if (isLoading) return <PostSkeleton />;
    if (isError || !post) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
                <h2 className="mb-4 text-2xl font-bold text-gray-900">Post Not Found</h2>
                <p className="mb-8 text-gray-500">The article you're looking for doesn't exist.</p>
                <Link to="/blogs" className="btn btn-primary bg-red-600 text-white hover:bg-red-700 px-6 py-2 rounded-full">
                    Back to Blog
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen font-sans">
            <SEO
                title={post.title}
                description={post.excerpt}
                ogType="article"
                ogImage={post.mainImage || undefined}
                canonical={`https://arcarrentalscebu.com/blogs/${post.slug.current}`}
                articlePublishedTime={post.publishedAt || undefined}
                author={post.author}
            />

            {/* ─── HERO SECTION ──────────────────────────────────────────────── */}
            <div className="relative w-full h-[70vh] md:h-[80vh] bg-neutral-900 overflow-hidden flex items-center justify-center">

                {/* Image Carousel Background */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentImageIndex}
                        className="absolute inset-0 w-full h-full"
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                    >
                        {headerImages.length > 0 && (
                            <img
                                src={headerImages[currentImageIndex]}
                                alt={post.title}
                                className="w-full h-full object-cover opacity-60"
                            />
                        )}
                        {/* Gradient Overlay for Text Readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
                    </motion.div>
                </AnimatePresence>

                {/* Hero Content (Centered Overlay) */}
                <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white space-y-6 mt-16">
                    {/* Category (Glass Card) */}
                    <div className="flex justify-center mb-6">
                        <span className="px-6 py-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-md text-sm font-bold tracking-widest text-white uppercase shadow-sm">
                            {post.categories?.[0] || 'General'}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {post.title}
                    </h1>

                    {/* Meta Row: Author • Date • Read Time */}
                    <div className="flex items-center justify-center gap-3 text-sm md:text-base text-white/90 font-medium pt-4">
                        {/* Author */}
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white border border-white/20">
                                <User size={14} />
                            </div>
                            <span>{post.author || 'AR Car Rentals'}</span>
                        </div>

                        {/* Red Dot */}
                        <span className="text-red-500 text-xs">●</span>

                        {/* Date */}
                        <span>
                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                        </span>

                        {/* Red Dot */}
                        <span className="text-red-500 text-xs">●</span>

                        {/* Read Time */}
                        <div className="flex items-center gap-1.5">
                            <Clock size={16} className="text-red-500" />
                            <span>{readingTime} {readingTime === 1 ? 'min' : 'mins'} read</span>
                        </div>
                    </div>
                </div>

                {/* Progress Indicators (Bottom Right inside Image) */}
                {hasMultipleImages && (
                    <div className="absolute bottom-8 right-8 z-20 flex flex-col items-end gap-3">
                        {/* Text Counter */}
                        <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-white/90 text-[10px] font-bold tracking-widest uppercase shadow-sm">
                            {currentImageIndex + 1} / {headerImages.length}
                        </div>

                        {/* Progress Bar Container */}
                        <div className="flex gap-1.5 w-32">
                            {headerImages.map((_, idx) => (
                                <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                                    {idx === currentImageIndex && (
                                        <motion.div
                                            className="h-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]"
                                            initial={{ width: "0%" }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ ease: "linear", duration: 0.05 }}
                                        />
                                    )}
                                    {idx < currentImageIndex && <div className="h-full w-full bg-white/80" />}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Back Button */}
                <Link
                    to="/blogs"
                    className="absolute top-8 left-8 z-30 flex items-center gap-2 text-white/70 hover:text-white transition-colors bg-black/20 hover:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-sm font-medium group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
                </Link>
            </div>

            {/* ─── CONTENT SECTION ───────────────────────────────────────────── */}
            <article className="max-w-4xl mx-auto px-6 md:px-12 py-16 md:py-24 relative z-10 mb-20">
                {/* Excerpt (SEO Description) */}
                {post.excerpt && (
                    <p className="text-xl md:text-2xl text-neutral-600 leading-relaxed font-medium mb-12 border-l-4 border-red-500 pl-6 italic">
                        {post.excerpt}
                    </p>
                )}

                {/* Body Content */}
                <div
                    className="prose prose-lg md:prose-xl prose-neutral max-w-none 
                        font-serif
                        prose-headings:font-sans prose-headings:font-bold prose-headings:text-neutral-900 
                        prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
                        prose-p:text-neutral-600 prose-p:leading-relaxed prose-p:mb-6
                        prose-a:text-red-600 prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-neutral-900 prose-strong:font-bold
                        prose-img:rounded-2xl prose-img:shadow-xl prose-img:my-10
                        prose-blockquote:border-l-4 prose-blockquote:border-red-500 prose-blockquote:bg-red-50/50 prose-blockquote:py-6 prose-blockquote:px-8 prose-blockquote:not-italic prose-blockquote:rounded-r-xl prose-blockquote:my-8
                        prose-ul:marker:text-red-500 prose-ol:marker:text-red-500
                    "
                    dangerouslySetInnerHTML={{ __html: post.body }}
                />

                {/* Share/Tags Section could go here */}
                <div className="mt-16 pt-8 border-t border-neutral-100 flex justify-center">
                    <p className="text-sm text-neutral-400 italic">
                        Published in <span className="text-neutral-600 font-medium not-italic">{post.categories?.[0] || 'General'}</span>
                    </p>
                </div>
            </article>

            {/* ─── UP NEXT SECTION ───────────────────────────────────────────── */}
            {relatedPosts.length > 0 && (
                <div className="bg-neutral-50 border-t border-neutral-200 py-20">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-2xl font-bold text-neutral-900">Up Next</h3>
                            <Link to="/blogs" className="text-red-600 font-bold text-sm hover:underline flex items-center gap-1">
                                View All <ChevronRight size={16} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedPosts.map(related => (
                                <Link
                                    key={related.id}
                                    to={`/blogs/${related.slug.current}`}
                                    className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-neutral-100 hover:border-red-100"
                                    onClick={() => window.scrollTo(0, 0)}
                                >
                                    <div className="h-48 overflow-hidden bg-neutral-100 relative">
                                        {related.mainImage ? (
                                            <img
                                                src={related.mainImage}
                                                alt={related.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                                <User size={32} />
                                            </div>
                                        )}
                                        {related.categories?.[0] && (
                                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-neutral-900 shadow-sm">
                                                {related.categories[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="mb-2 flex items-center gap-2 text-xs text-neutral-500 font-medium">
                                            <Calendar size={12} />
                                            {related.publishedAt ? formatDate(related.publishedAt) : 'Recently'}
                                        </div>
                                        <h4 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-red-600 transition-colors line-clamp-2">
                                            {related.title}
                                        </h4>
                                        <p className="text-sm text-neutral-500 line-clamp-3 mb-4 flex-1">
                                            {related.excerpt}
                                        </p>
                                        <div className="flex items-center text-red-600 text-xs font-bold uppercase tracking-wider mt-auto">
                                            Read Article <ChevronRight size={12} className="ml-1 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlogPostPage;
