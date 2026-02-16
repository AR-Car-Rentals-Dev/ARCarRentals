import { type FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    FileText,
    CheckCircle2,
    ArchiveRestore,
    Send,
} from 'lucide-react';
import { Button, Input, ConfirmDialog } from '@components/ui';
import { getAllPosts, deletePost, updatePost, type BlogPost } from '@services/blogService';
import { AdminPageSkeleton } from '@components/ui/AdminPageSkeleton';

type FilterTab = 'all' | 'published' | 'draft';

/**
 * Admin Blog Management Page — WordPress-style table layout
 */
export const AdminBlogsPage: FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<FilterTab>('all');
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    // Fetch posts
    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            const data = await getAllPosts();
            setPosts(data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    // Counts
    const publishedCount = posts.filter(p => p.isPublished).length;
    const draftCount = posts.filter(p => !p.isPublished).length;

    // Filter posts
    const filteredPosts = posts
        .filter(post => {
            if (activeTab === 'published') return post.isPublished;
            if (activeTab === 'draft') return !post.isPublished;
            return true;
        })
        .filter(post =>
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.author.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const handleEdit = (post: BlogPost) => {
        navigate(`/admin/blogs/${post.id}`);
    };

    const handleDeleteClick = (post: BlogPost) => {
        setSelectedPost(post);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedPost) return;
        setIsSubmitting(true);
        try {
            await deletePost(selectedPost.id);
            setIsDeleteDialogOpen(false);
            setSelectedPost(null);
            fetchPosts();
        } catch (error) {
            console.error("Failed to delete", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (post: BlogPost) => {
        const newStatus = !post.isPublished;
        try {
            await updatePost(post.id, { isPublished: newStatus });
            fetchPosts();
        } catch (error) {
            console.error('Failed to toggle status:', error);
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    if (isLoading && posts.length === 0) {
        return <AdminPageSkeleton />;
    }

    return (
        <>
            <div className="flex flex-col gap-0 font-sans">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">Posts</h1>
                    </div>
                    <Button
                        className="bg-red-600 hover:bg-red-700 text-white border-none gap-1.5"
                        size="sm"
                        onClick={() => navigate('/admin/blogs/new')}
                    >
                        <Plus className="h-4 w-4" />
                        Add New Post
                    </Button>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 text-sm border-b border-neutral-200 mb-4">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2.5 font-medium transition-colors relative ${activeTab === 'all' ? 'text-red-600' : 'text-neutral-500 hover:text-neutral-900'}`}
                    >
                        All <span className="text-neutral-400 ml-1">({posts.length})</span>
                        {activeTab === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>}
                    </button>
                    <span className="text-neutral-300">|</span>
                    <button
                        onClick={() => setActiveTab('published')}
                        className={`px-4 py-2.5 font-medium transition-colors relative ${activeTab === 'published' ? 'text-red-600' : 'text-neutral-500 hover:text-neutral-900'}`}
                    >
                        Published <span className="text-neutral-400 ml-1">({publishedCount})</span>
                        {activeTab === 'published' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>}
                    </button>
                    <span className="text-neutral-300">|</span>
                    <button
                        onClick={() => setActiveTab('draft')}
                        className={`px-4 py-2.5 font-medium transition-colors relative ${activeTab === 'draft' ? 'text-red-600' : 'text-neutral-500 hover:text-neutral-900'}`}
                    >
                        Drafts <span className="text-neutral-400 ml-1">({draftCount})</span>
                        {activeTab === 'draft' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>}
                    </button>
                </div>

                {/* Search Bar */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 max-w-sm">
                        <Input
                            placeholder="Search posts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            leftIcon={<Search className="h-4 w-4 text-neutral-400" />}
                        />
                    </div>
                </div>

                {/* Table */}
                {filteredPosts.length === 0 ? (
                    <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
                        <FileText className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-neutral-900 mb-2">No posts found</h3>
                        <p className="text-neutral-500 mb-6">
                            {activeTab !== 'all'
                                ? `No ${activeTab} posts found. Try switching tabs.`
                                : 'Create your first blog post to get started.'
                            }
                        </p>
                        <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => navigate('/admin/blogs/new')}>
                            <Plus className="h-5 w-5 mr-2" />
                            Add First Post
                        </Button>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-neutral-50 border-b border-neutral-200">
                                    <th className="px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider w-[45%]">Title</th>
                                    <th className="px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Author</th>
                                    <th className="px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider hidden lg:table-cell">Categories</th>
                                    <th className="px-4 py-3 text-xs font-bold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPosts.map((post) => (
                                    <tr
                                        key={post.id}
                                        className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50 transition-colors"
                                        onMouseEnter={() => setHoveredRow(post.id)}
                                        onMouseLeave={() => setHoveredRow(null)}
                                    >
                                        {/* Title Column */}
                                        <td className="px-4 py-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(post)}
                                                        className="text-sm font-bold text-red-700 hover:text-red-800 hover:underline text-left leading-snug"
                                                    >
                                                        {post.title}
                                                    </button>
                                                    {post.isPublished ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 flex-shrink-0">
                                                            <CheckCircle2 size={10} />
                                                            Published
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 border border-neutral-200 flex-shrink-0">
                                                            Draft
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Hover Actions */}
                                                <div className={`flex items-center gap-1 mt-1.5 text-xs transition-opacity ${hoveredRow === post.id ? 'opacity-100' : 'opacity-0'}`}>
                                                    <button
                                                        onClick={() => handleEdit(post)}
                                                        className="text-red-600 hover:text-red-800 font-medium flex items-center gap-0.5"
                                                    >
                                                        <Edit size={11} /> Edit
                                                    </button>
                                                    <span className="text-neutral-300 mx-1">|</span>
                                                    <button
                                                        onClick={() => handleDeleteClick(post)}
                                                        className="text-red-600 hover:text-red-800 font-medium flex items-center gap-0.5"
                                                    >
                                                        <Trash2 size={11} /> Trash
                                                    </button>
                                                    <span className="text-neutral-300 mx-1">|</span>
                                                    <button
                                                        onClick={() => handleToggleStatus(post)}
                                                        className="text-red-600 hover:text-red-800 font-medium flex items-center gap-0.5"
                                                    >
                                                        {post.isPublished ? (
                                                            <><ArchiveRestore size={11} /> Switch to Draft</>
                                                        ) : (
                                                            <><Send size={11} /> Publish</>
                                                        )}
                                                    </button>
                                                    <span className="text-neutral-300 mx-1">|</span>
                                                    <a
                                                        href={`/blogs/${post.slug.current}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-red-600 hover:text-red-800 font-medium flex items-center gap-0.5"
                                                    >
                                                        <Eye size={11} /> View
                                                    </a>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Author */}
                                        <td className="px-4 py-3 text-sm text-neutral-600 hidden md:table-cell">
                                            {post.author}
                                        </td>

                                        {/* Category */}
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <div className="flex flex-wrap gap-1">
                                                {post.categories?.map(cat => (
                                                    <span key={cat} className="text-[11px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                                        {cat}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td className="px-4 py-3 text-sm text-neutral-500 hidden sm:table-cell whitespace-nowrap">
                                            {post.isPublished ? (
                                                <div>
                                                    <div className="text-neutral-700 font-medium">Published</div>
                                                    <div className="text-xs text-neutral-400">{formatDate(post.publishedAt)}</div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="text-neutral-500">Last Modified</div>
                                                    <div className="text-xs text-neutral-400">{formatDate(post.publishedAt)}</div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Table Footer */}
                        <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
                            <span>{filteredPosts.length} item{filteredPosts.length !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Post"
                message={`Are you sure you want to delete "${selectedPost?.title}"? This action cannot be undone.`}
                confirmText="Move to Trash"
                variant="danger"
                isLoading={isSubmitting}
            />
        </>
    );
};

export default AdminBlogsPage;
