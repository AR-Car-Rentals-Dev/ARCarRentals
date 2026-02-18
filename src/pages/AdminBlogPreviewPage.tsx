import { type FC, useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit, User, Clock } from 'lucide-react';
import { Button } from '@components/ui';
import { motion, AnimatePresence } from 'framer-motion';

interface PreviewState {
    title: string;
    body: string;
    excerpt: string;
    author: string;
    category: string;
    imageUrl: string;
    headerImages?: string[];
    isPublished: boolean;
    slug: string;
}



const READING_TIME_WPM = 200;

export const AdminBlogPreviewPage: FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const state = location.state as PreviewState | null;

    // Carousel State
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    // Derived Data
    const headerImages = state?.headerImages && state.headerImages.length > 0
        ? state.headerImages
        : (state?.imageUrl ? [state.imageUrl] : []);

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
    }, [hasMultipleImages, headerImages.length, currentImageIndex]);


    if (!state) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Preview Not Available</h2>
                <p className="text-neutral-500 mb-6">No preview data available. Please navigate here from the editor.</p>
                <Button onClick={() => navigate(id ? `/admin/blogs/${id}` : '/admin/blogs')} className="bg-red-600 hover:bg-red-700 text-white">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Editor
                </Button>
            </div>
        );
    }

    const readingTime = state.body ? Math.max(1, Math.ceil(state.body.replace(/(<([^>]+)>)/gi, "").split(/\s+/).length / READING_TIME_WPM)) : 1;

    return (
        <div className="bg-white min-h-screen font-sans">
            {/* Status Banner */}
            <div className={`fixed top-20 right-6 z-50 px-4 py-2 flex items-center gap-3 rounded-full shadow-lg border backdrop-blur-md ${state.isPublished ? 'bg-green-50/90 border-green-200 text-green-700' : 'bg-amber-50/90 border-amber-200 text-amber-700'}`}>
                <div className={`w-2 h-2 rounded-full ${state.isPublished ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`}></div>
                <span className="text-xs font-bold uppercase tracking-wider">
                    {state.isPublished ? 'Published' : 'Preview Mode'}
                </span>
                <div className="h-4 w-px bg-current opacity-20 mx-1"></div>
                <button
                    onClick={() => navigate(id ? `/admin/blogs/${id}` : '/admin/blogs')}
                    className="flex items-center gap-1 hover:underline text-xs font-bold uppercase tracking-wider"
                >
                    <Edit size={12} /> Edit
                </button>
            </div>

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
                                alt={state.title}
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
                            {state.category || 'General'}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {state.title || 'Untitled Post'}
                    </h1>

                    {/* Meta Row: Author • Date • Read Time */}
                    <div className="flex items-center justify-center gap-3 text-sm md:text-base text-white/90 font-medium pt-4">
                        {/* Author */}
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white border border-white/20">
                                <User size={14} />
                            </div>
                            <span>{state.author || 'AR Car Rentals'}</span>
                        </div>

                        {/* Red Dot */}
                        <span className="text-red-500 text-xs">●</span>

                        {/* Date */}
                        <span>
                            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                <button
                    onClick={() => navigate(id ? `/admin/blogs/${id}` : '/admin/blogs')}
                    className="absolute top-8 left-8 z-30 flex items-center gap-2 text-white/70 hover:text-white transition-colors bg-black/20 hover:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-sm font-medium group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Editor
                </button>
            </div>

            {/* ─── CONTENT SECTION ───────────────────────────────────────────── */}
            <article className="max-w-4xl mx-auto px-6 md:px-12 py-16 md:py-24 relative z-10 mb-20">
                {/* Excerpt (SEO Description) */}
                {state.excerpt && (
                    <p className="text-xl md:text-2xl text-neutral-600 leading-relaxed font-medium mb-12 border-l-4 border-red-500 pl-6 italic">
                        {state.excerpt}
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
                    dangerouslySetInnerHTML={{ __html: state.body || '<p>Start typing your content...</p>' }}
                />

                {/* Share/Tags Section could go here */}
                <div className="mt-16 pt-8 border-t border-neutral-100 flex justify-center">
                    <p className="text-sm text-neutral-400 italic">
                        Published in <span className="text-neutral-600 font-medium not-italic">{state.category || 'General'}</span>
                    </p>
                </div>

                {/* Preview Disclaimer Footer */}
                <div className="mt-16 border-t border-neutral-200 pt-8 text-center pb-20">
                    <p className="mb-4 text-neutral-500 text-sm">This is a preview. The post has not been published yet.</p>
                    <Button
                        onClick={() => navigate(id ? `/admin/blogs/${id}` : '/admin/blogs')}
                        className="bg-red-600 hover:bg-red-700 text-white gap-2"
                    >
                        <Edit size={16} />
                        Return to Editor
                    </Button>
                </div>
            </article>
        </div>
    );
};

export default AdminBlogPreviewPage;
