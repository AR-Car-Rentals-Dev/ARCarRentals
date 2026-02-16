import { type FC } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, User, Tag } from 'lucide-react';
import { Button } from '@components/ui';

interface PreviewState {
    title: string;
    body: string;
    excerpt: string;
    author: string;
    category: string;
    imageUrl: string;
    isPublished: boolean;
    slug: string;
}

const formatDate = (): string => {
    return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const AdminBlogPreviewPage: FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const state = location.state as PreviewState | null;

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

    return (
        <div className="font-sans">
            {/* Status Banner */}
            <div className={`px-6 py-3 flex items-center justify-between rounded-xl mb-6 ${state.isPublished ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${state.isPublished ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`}></div>
                    <span className={`text-sm font-bold uppercase tracking-wider ${state.isPublished ? 'text-green-700' : 'text-amber-700'}`}>
                        {state.isPublished ? '● Published' : '● Draft — Preview Mode'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(id ? `/admin/blogs/${id}` : '/admin/blogs')}
                        className="text-neutral-600 hover:bg-white"
                    >
                        <ArrowLeft size={14} className="mr-1.5" />
                        Back
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => navigate(id ? `/admin/blogs/${id}` : '/admin/blogs')}
                        className="bg-red-600 hover:bg-red-700 text-white gap-1.5"
                    >
                        <Edit size={14} />
                        Edit Post
                    </Button>
                </div>
            </div>

            {/* Article Preview */}
            <article className="max-w-4xl mx-auto">
                {/* Hero Image */}
                {state.imageUrl && (
                    <div className="mb-8 overflow-hidden rounded-2xl shadow-lg">
                        <img
                            src={state.imageUrl}
                            alt={state.title}
                            className="w-full max-h-[400px] object-cover"
                        />
                    </div>
                )}

                {/* Title */}
                <h1
                    className="mb-6 text-3xl font-extrabold tracking-tight text-neutral-900 md:text-4xl lg:text-5xl"
                    style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
                >
                    {state.title || 'Untitled Post'}
                </h1>

                {/* Meta Row */}
                <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                    {state.author && (
                        <span className="flex items-center gap-1.5">
                            <User size={14} />
                            {state.author}
                        </span>
                    )}
                    <span className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {formatDate()}
                    </span>
                    {state.category && (
                        <span className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
                            <Tag size={12} />
                            {state.category}
                        </span>
                    )}
                </div>

                {/* Excerpt */}
                {state.excerpt && (
                    <p className="mb-8 text-lg text-neutral-600 italic border-l-4 border-red-300 pl-4">
                        {state.excerpt}
                    </p>
                )}

                {/* Body Content */}
                <div
                    className="prose prose-lg prose-red mx-auto max-w-none
                        prose-headings:text-neutral-900 prose-headings:font-bold
                        prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                        prose-p:my-4 prose-p:leading-relaxed prose-p:text-neutral-700
                        prose-a:text-red-600 prose-a:underline hover:prose-a:text-red-700
                        prose-blockquote:border-l-4 prose-blockquote:border-red-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-neutral-600
                        prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6
                        prose-code:bg-neutral-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
                        prose-img:rounded-lg prose-img:shadow-md prose-img:max-w-full"
                    dangerouslySetInnerHTML={{ __html: state.body || '<p>No content yet.</p>' }}
                />

                {/* Bottom CTA */}
                <div className="mt-16 border-t border-neutral-200 pt-8 text-center">
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
