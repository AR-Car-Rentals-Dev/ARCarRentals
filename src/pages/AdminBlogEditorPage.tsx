import { type FC, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useBlocker } from 'react-router-dom';
import {
    ChevronRight,
    Cloud,
    Send,
    Users,
    BookOpen,
    Info,
    Image as ImageIcon,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    AlignLeft,
    AlignCenter,
    AlignRight,
    List,
    ListOrdered,
    Quote,
    Link as LinkIcon,
    Save,
    X,
    AlertTriangle,
    Eye,
    Calendar,
} from 'lucide-react';
import { createPost, updatePost, getAllPosts, uploadBlogImage } from '@services/blogService';
import { Button, Modal } from '@components/ui';
import { ImageCropModal } from '@components/ui/ImageCropModal';

// ─── Rich Text Toolbar Button ─────────────────────────────────────────────────

interface ToolbarBtnProps {
    icon: React.ReactNode;
    command: string;
    value?: string;
    active?: boolean;
    onClick?: () => void;
    title?: string;
}

const ToolbarBtn: FC<ToolbarBtnProps> = ({ icon, command, value, active, onClick, title }) => {
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (onClick) {
            onClick();
        } else {
            document.execCommand(command, false, value);
        }
    };

    return (
        <button
            onMouseDown={handleClick}
            className={`p-1.5 rounded transition-colors ${active ? 'bg-red-100 text-red-700' : 'hover:bg-neutral-200 text-neutral-600'}`}
            title={title || command}
            type="button"
        >
            {icon}
        </button>
    );
};

// ─── Main Editor Component ────────────────────────────────────────────────────

export const AdminBlogEditorPage: FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = Boolean(id);

    // Form State
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [body, setBody] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [author, setAuthor] = useState('Alex Johnson');
    const [category, setCategory] = useState('Travel Guides');
    const [imageUrl, setImageUrl] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Auto-Sync State
    const [isSaving, setIsSaving] = useState(false);
    const [lastSync, setLastSync] = useState<string>('');
    const [isDirty, setIsDirty] = useState(false);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Image Upload State
    const [isUploading, setIsUploading] = useState(false);

    // Image Crop Modal State
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [cropImageSrc, setCropImageSrc] = useState('');
    const [cropFileName, setCropFileName] = useState('');

    // Schedule State
    const [publishMode, setPublishMode] = useState<'immediately' | 'scheduled'>('immediately');
    const [scheduledDate, setScheduledDate] = useState('');

    // Rich Text Editor
    const editorRef = useRef<HTMLDivElement>(null);
    const inlineImageInputRef = useRef<HTMLInputElement>(null);
    const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});
    const [currentBlock, setCurrentBlock] = useState('p');
    const bodyRef = useRef(body); // Keep a ref in sync to avoid stale closures

    // Stats
    const textContent = editorRef.current?.textContent || '';
    const wordCount = textContent.trim().split(/\s+/).filter(w => w.length > 0).length;
    const charCount = textContent.length;

    // ─── Unsaved Changes Blocker ──────────────────────────────────────

    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            isDirty && currentLocation.pathname !== nextLocation.pathname
    );

    // ─── Check Active Formatting ──────────────────────────────────────

    const checkActiveFormats = useCallback(() => {
        const formats: Record<string, boolean> = {
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            strikeThrough: document.queryCommandState('strikeThrough'),
            justifyLeft: document.queryCommandState('justifyLeft'),
            justifyCenter: document.queryCommandState('justifyCenter'),
            justifyRight: document.queryCommandState('justifyRight'),
            insertUnorderedList: document.queryCommandState('insertUnorderedList'),
            insertOrderedList: document.queryCommandState('insertOrderedList'),
        };
        setActiveFormats(formats);

        // Check current block format
        const block = document.queryCommandValue('formatBlock');
        setCurrentBlock(block || 'p');
    }, []);

    // ─── Fetch Post Data ──────────────────────────────────────────────

    useEffect(() => {
        const fetchPost = async () => {
            if (isEditMode && id) {
                let post = null;
                try {
                    const posts = await getAllPosts();
                    post = posts.find(p => p.id === id);
                } catch (e) {
                    console.error("Error fetching post", e);
                }

                if (post) {
                    setTitle(post.title);
                    setSlug(post.slug.current);
                    setBody(post.body);
                    setExcerpt(post.excerpt);
                    setAuthor(post.author);
                    setIsPublished(post.isPublished || false);
                    if (post.categories && post.categories.length > 0) setCategory(post.categories[0]);
                    setImageUrl(post.mainImage || '');
                    setLastSync(new Date(post.publishedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                    setIsDirty(false);
                    // Set the editor content after state is loaded
                    if (editorRef.current) {
                        editorRef.current.innerHTML = post.body;
                    }
                }
            } else {
                const defaultBody = '<p>Start writing your amazing blog post here...</p>';
                setBody(defaultBody);
                setLastSync('');
                setIsDirty(false);
                if (editorRef.current) {
                    editorRef.current.innerHTML = defaultBody;
                }
            }
        };
        fetchPost();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditMode, id]);

    // Keep bodyRef in sync
    useEffect(() => {
        bodyRef.current = body;
    }, [body]);

    // ─── Browser Refresh/Close Protection ─────────────────────────────

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    // ─── Auto-generate slug ───────────────────────────────────────────

    useEffect(() => {
        if (!isEditMode && title && !slug) {
            setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
        }
    }, [title, slug, isEditMode]);

    // ─── Auto-Sync Logic ──────────────────────────────────────────────

    useEffect(() => {
        if (!isDirty || !title) return;

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(async () => {
            setIsSaving(true);
            try {
                const postData = {
                    title,
                    slug: { current: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') },
                    author,
                    mainImage: imageUrl || null,
                    excerpt: excerpt || (bodyRef.current ? bodyRef.current.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...' : ''),
                    body: bodyRef.current,
                    categories: [category],
                };

                if (id) {
                    await updatePost(id, postData);
                    setLastSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                    setIsDirty(false);
                }
            } catch (error) {
                console.error('Auto-sync failed:', error);
            } finally {
                setIsSaving(false);
            }
        }, 3000);

        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [title, slug, body, excerpt, author, category, imageUrl, id, isDirty]);

    // ─── Selection change listener ────────────────────────────────────

    useEffect(() => {
        document.addEventListener('selectionchange', checkActiveFormats);
        return () => document.removeEventListener('selectionchange', checkActiveFormats);
    }, [checkActiveFormats]);

    // ─── Handlers ─────────────────────────────────────────────────────

    const handleChange = (setter: (val: any) => void, value: any) => {
        setter(value);
        setIsDirty(true);
    };

    const handleEditorInput = () => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            setBody(html);
            bodyRef.current = html;
            setIsDirty(true);
        }
    };

    const handleEditorKeyDown = (e: React.KeyboardEvent) => {
        // Keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    document.execCommand('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    document.execCommand('italic');
                    break;
                case 'u':
                    e.preventDefault();
                    document.execCommand('underline');
                    break;
            }
            checkActiveFormats();
        }
    };

    const handleFormatBlock = (value: string) => {
        document.execCommand('formatBlock', false, value);
        setCurrentBlock(value);
        setIsDirty(true);
    };

    const handleInsertLink = () => {
        const url = prompt('Enter URL:');
        if (url) {
            document.execCommand('createLink', false, url);
            // Style links blue so admin can visually identify them
            if (editorRef.current) {
                const links = editorRef.current.querySelectorAll('a');
                links.forEach(link => {
                    link.style.color = '#2563eb';
                    link.style.textDecoration = 'underline';
                });
            }
            setIsDirty(true);
        }
    };

    const handleInsertImage = () => {
        // Trigger hidden file input for inline image upload
        inlineImageInputRef.current?.click();
    };

    const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Read file and open crop modal
        const reader = new FileReader();
        reader.onload = () => {
            setCropImageSrc(reader.result as string);
            setCropFileName(file.name);
            setCropModalOpen(true);
        };
        reader.readAsDataURL(file);
        // Reset input so same file can be selected again
        e.target.value = '';
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        setCropModalOpen(false);
        try {
            // Create a File from the blob to pass to uploadBlogImage
            const file = new File([croppedBlob], cropFileName || 'cropped-image.jpg', { type: 'image/jpeg' });
            const url = await uploadBlogImage(file);
            // Focus the editor and insert the image
            editorRef.current?.focus();
            document.execCommand('insertImage', false, url);
            setIsDirty(true);
            handleEditorInput();
        } catch (error) {
            console.error('Image upload failed:', error);
            alert('Failed to upload image. Please try again.');
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadBlogImage(file);
            setImageUrl(url);
            setIsDirty(true);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (publish = false) => {
        setIsSubmitting(true);
        try {
            const currentBody = editorRef.current?.innerHTML || body;
            const postData = {
                title,
                slug: { current: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') },
                author,
                mainImage: imageUrl || null,
                excerpt: excerpt || currentBody.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...',
                body: currentBody,
                categories: [category],
                isPublished: publish
            };

            let savedPost;
            if (isEditMode && id) {
                savedPost = await updatePost(id, postData);
            } else {
                savedPost = await createPost(postData);
            }

            setLastSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            setIsDirty(false);
            if (publish) setIsPublished(true);

            if (publish) {
                navigate('/admin/blogs');
            } else if (!isEditMode && savedPost) {
                navigate(`/admin/blogs/${savedPost.id}`, { replace: true });
            }
        } catch (error) {
            console.error('Error saving post:', error);
            alert('Failed to save post. Please check your connection.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─── Save Draft & Leave (for blocker dialog) ──────────────────────

    const handleSaveDraftAndLeave = async () => {
        try {
            const currentBody = editorRef.current?.innerHTML || body;
            const postData = {
                title,
                slug: { current: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') },
                author,
                mainImage: imageUrl || null,
                excerpt: excerpt || currentBody.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...',
                body: currentBody,
                categories: [category],
            };

            if (isEditMode && id) {
                await updatePost(id, postData);
            } else {
                await createPost(postData);
            }
            setIsDirty(false);
        } catch (error) {
            console.error('Error saving draft:', error);
        }
        if (blocker.proceed) blocker.proceed();
    };

    // ─── Preview ──────────────────────────────────────────────────────

    const handlePreview = async () => {
        // Save first if dirty before previewing
        const currentBody = editorRef.current?.innerHTML || body;
        let postId = id;

        if (!postId) {
            // Need to save first for new posts
            try {
                const postData = {
                    title,
                    slug: { current: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') },
                    author,
                    mainImage: imageUrl || null,
                    excerpt: excerpt || currentBody.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...',
                    body: currentBody,
                    categories: [category],
                };
                const savedPost = await createPost(postData);
                postId = savedPost.id;
                setIsDirty(false);
            } catch (error) {
                console.error('Error saving before preview:', error);
                alert('Failed to save post before preview.');
                return;
            }
        }

        navigate(`/admin/blogs/${postId}/preview`, {
            state: {
                title,
                body: currentBody,
                excerpt,
                author,
                category,
                imageUrl,
                isPublished,
                slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
            }
        });
    };

    // ─── Render ───────────────────────────────────────────────────────

    return (
        <div className="flex flex-col gap-6 font-sans">
            {/* Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium mb-1">
                        <span className="cursor-pointer hover:text-neutral-900" onClick={() => navigate('/admin/blogs')}>Blogs</span>
                        <ChevronRight size={10} />
                        <span className="text-neutral-900">{isEditMode ? 'Edit Post' : 'Create New Post'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-neutral-900">Post Editor</h1>
                        {isPublished ? (
                            <button
                                onClick={async () => {
                                    if (isEditMode && id) {
                                        await updatePost(id, { isPublished: false });
                                        setIsPublished(false);
                                    }
                                }}
                                className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 hover:bg-amber-100 hover:text-amber-700 hover:border-amber-200 transition-colors cursor-pointer"
                                title="Click to switch to Draft"
                            >
                                Published ✓
                            </button>
                        ) : (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-500 border border-neutral-200">Draft</span>
                        )}
                        {isSaving && <span className="text-xs text-neutral-400 animate-pulse">Syncing...</span>}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isDirty ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                        <Cloud size={14} />
                        <span className="text-xs font-bold uppercase tracking-wide">
                            {isSaving ? 'Syncing...' : lastSync ? `Saved ${lastSync}` : isDirty ? 'Unsaved' : 'Saved'}
                        </span>
                    </div>
                    {isPublished && isEditMode ? (
                        <Button
                            variant="ghost"
                            className="text-amber-600 hover:bg-amber-50 border border-amber-200 gap-1.5"
                            onClick={async () => {
                                if (id) {
                                    await updatePost(id, { isPublished: false });
                                    setIsPublished(false);
                                }
                            }}
                        >
                            Switch to Draft
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            className="text-neutral-600 hover:bg-neutral-100"
                            onClick={() => handleSubmit(false)}
                            isLoading={isSubmitting && !isSaving}
                        >
                            Save Draft
                        </Button>
                    )}
                    <Button
                        onClick={() => handleSubmit(true)}
                        isLoading={isSubmitting}
                        className="bg-red-600 hover:bg-red-700 text-white gap-2"
                    >
                        <span>{isPublished ? 'Update' : isEditMode ? 'Update & Publish' : 'Publish Blog'}</span>
                        <Send size={16} />
                    </Button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Editor */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Main Title Input */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 block">Blog Post Title</label>
                        <input
                            className="w-full bg-transparent border-none p-0 text-3xl font-bold focus:ring-0 placeholder:text-neutral-300 text-neutral-900 outline-none"
                            placeholder="Enter post title here..."
                            type="text"
                            value={title}
                            onChange={(e) => handleChange(setTitle, e.target.value)}
                        />
                    </div>

                    {/* Editor Canvas */}
                    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden flex flex-col min-h-[600px]">
                        {/* Toolbar */}
                        <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-200 flex items-center gap-1 flex-wrap sticky top-0 z-10">
                            {/* Block Format */}
                            <select
                                value={currentBlock}
                                onChange={(e) => handleFormatBlock(e.target.value)}
                                className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer hover:bg-neutral-100 p-1.5 rounded outline-none text-neutral-700"
                            >
                                <option value="p">Paragraph</option>
                                <option value="h1">Heading 1</option>
                                <option value="h2">Heading 2</option>
                                <option value="h3">Heading 3</option>
                                <option value="h4">Heading 4</option>
                            </select>
                            <div className="w-px h-5 bg-neutral-300 mx-1"></div>

                            {/* Inline Formatting */}
                            <ToolbarBtn icon={<Bold size={18} />} command="bold" active={activeFormats.bold} title="Bold (Ctrl+B)" />
                            <ToolbarBtn icon={<Italic size={18} />} command="italic" active={activeFormats.italic} title="Italic (Ctrl+I)" />
                            <ToolbarBtn icon={<Underline size={18} />} command="underline" active={activeFormats.underline} title="Underline (Ctrl+U)" />
                            <ToolbarBtn icon={<Strikethrough size={18} />} command="strikeThrough" active={activeFormats.strikeThrough} title="Strikethrough" />
                            <div className="w-px h-5 bg-neutral-300 mx-1"></div>

                            {/* Alignment */}
                            <ToolbarBtn icon={<AlignLeft size={18} />} command="justifyLeft" active={activeFormats.justifyLeft} title="Align Left" />
                            <ToolbarBtn icon={<AlignCenter size={18} />} command="justifyCenter" active={activeFormats.justifyCenter} title="Align Center" />
                            <ToolbarBtn icon={<AlignRight size={18} />} command="justifyRight" active={activeFormats.justifyRight} title="Align Right" />
                            <div className="w-px h-5 bg-neutral-300 mx-1"></div>

                            {/* Lists & Block */}
                            <ToolbarBtn icon={<List size={18} />} command="insertUnorderedList" active={activeFormats.insertUnorderedList} title="Bullet List" />
                            <ToolbarBtn icon={<ListOrdered size={18} />} command="insertOrderedList" active={activeFormats.insertOrderedList} title="Numbered List" />
                            <ToolbarBtn icon={<Quote size={18} />} command="formatBlock" value="blockquote" title="Blockquote" />
                            <div className="w-px h-5 bg-neutral-300 mx-1"></div>

                            {/* Insert */}
                            <ToolbarBtn icon={<LinkIcon size={18} />} command="createLink" onClick={handleInsertLink} title="Insert Link" />
                            <ToolbarBtn icon={<ImageIcon size={18} />} command="insertImage" onClick={handleInsertImage} title="Insert Image" />
                        </div>

                        {/* Hidden file input for inline image uploads */}
                        <input
                            type="file"
                            ref={inlineImageInputRef}
                            accept="image/*"
                            onChange={handleInlineImageUpload}
                            className="hidden"
                        />

                        {/* Editor Content Area (Rich Text) */}
                        <div className="flex-1 p-6">
                            <div
                                ref={editorRef}
                                contentEditable
                                suppressContentEditableWarning
                                className="w-full min-h-[500px] outline-none text-neutral-800 leading-relaxed text-base prose prose-lg max-w-none
                                    prose-headings:text-neutral-900 prose-headings:font-bold
                                    prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg
                                    prose-p:my-3 prose-p:leading-relaxed
                                    prose-a:text-blue-600 prose-a:underline prose-a:cursor-pointer
                                    prose-blockquote:border-l-4 prose-blockquote:border-red-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-neutral-600
                                    prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6
                                    prose-code:bg-neutral-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
                                    prose-img:rounded-lg prose-img:shadow-md prose-img:max-w-full"
                                onInput={handleEditorInput}
                                onKeyDown={handleEditorKeyDown}
                                onMouseUp={checkActiveFormats}
                                style={{ fontFamily: "'Inter', sans-serif" }}
                            />
                        </div>

                        {/* Stats Footer */}
                        <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50 flex justify-between items-center text-xs font-medium text-neutral-500 uppercase tracking-wide">
                            <div className="flex gap-4">
                                <span>Words: {wordCount}</span>
                                <span>Characters: {charCount}</span>
                            </div>
                            <span>Last Sync: {lastSync || 'Never'}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings & Uploads */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Metadata Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 space-y-5">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2 mb-2">
                            <Info size={16} className="text-red-600" /> Post Settings
                        </h3>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Category</label>
                            <select
                                value={category}
                                onChange={(e) => handleChange(setCategory, e.target.value)}
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all"
                            >
                                <option>Travel Guides</option>
                                <option>Car Maintenance</option>
                                <option>Rental Tips</option>
                                <option>Company News</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Author</label>
                            <div className="relative">
                                <input
                                    className="w-full bg-neutral-50 border border-neutral-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all"
                                    type="text"
                                    value={author}
                                    onChange={(e) => handleChange(setAuthor, e.target.value)}
                                    placeholder="Enter author name"
                                />
                                <div className="absolute left-3 top-2.5 text-neutral-400">
                                    <Users size={16} />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Excerpt / SEO Desc</label>
                            <textarea
                                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all resize-none"
                                placeholder="Enter a brief summary..."
                                rows={4}
                                value={excerpt}
                                onChange={(e) => handleChange(setExcerpt, e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Image Upload Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2 mb-2">
                            <ImageIcon size={16} className="text-red-600" /> Media Assets
                        </h3>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Header Image</label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="image-upload"
                                    disabled={isUploading}
                                />
                                <label
                                    htmlFor="image-upload"
                                    className={`group relative rounded-lg overflow-hidden border-2 border-dashed ${isUploading ? 'border-red-400 bg-red-50' : 'border-neutral-200 hover:border-red-500/50'} transition-all aspect-video flex flex-col items-center justify-center bg-neutral-50 cursor-pointer`}
                                >
                                    {isUploading ? (
                                        <div className="flex flex-col items-center animate-pulse">
                                            <Cloud size={24} className="text-red-500 mb-2" />
                                            <p className="text-xs font-medium text-red-600">Uploading...</p>
                                        </div>
                                    ) : imageUrl ? (
                                        <>
                                            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <p className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                                    <ImageIcon size={14} /> Change Image
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-4">
                                            <Cloud size={24} className="text-neutral-400 mb-2 mx-auto group-hover:text-red-500 transition-colors" />
                                            <p className="text-xs font-medium text-neutral-400 group-hover:text-red-600 transition-colors">Click to upload image</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                            {imageUrl && (
                                <p className="text-[10px] text-neutral-400 truncate mt-1">
                                    Current: {imageUrl.split('/').pop()}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Publishing Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2 mb-4">
                            <BookOpen size={16} className="text-red-600" /> Publishing
                        </h3>
                        <div className="space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer group" onClick={() => setPublishMode('immediately')}>
                                <div className={`w-4 h-4 rounded-full ${publishMode === 'immediately' ? 'border-[5px] border-red-600 shadow-sm' : 'border-2 border-neutral-300'}`}></div>
                                <span className="text-sm font-medium text-neutral-900">Immediately</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer group" onClick={() => setPublishMode('scheduled')}>
                                <div className={`w-4 h-4 rounded-full ${publishMode === 'scheduled' ? 'border-[5px] border-red-600 shadow-sm' : 'border-2 border-neutral-300'}`}></div>
                                <span className="text-sm font-medium text-neutral-900">Schedule for later</span>
                            </label>
                            {publishMode === 'scheduled' && (
                                <div className="mt-2 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-neutral-400" />
                                        <input
                                            type="datetime-local"
                                            value={scheduledDate}
                                            onChange={(e) => setScheduledDate(e.target.value)}
                                            min={new Date().toISOString().slice(0, 16)}
                                            className="text-sm border border-neutral-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none w-full"
                                        />
                                    </div>
                                    {scheduledDate && (
                                        <p className="text-[11px] text-neutral-500">
                                            Scheduled: {new Date(scheduledDate).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    )}
                                </div>
                            )}
                            <div className="pt-4 border-t border-neutral-100">
                                <Button
                                    variant="outline"
                                    className="w-full text-xs font-bold uppercase tracking-wider gap-2"
                                    onClick={handlePreview}
                                >
                                    <Eye size={14} />
                                    Post Preview
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Unsaved Changes Dialog ──────────────────────────────────── */}
            {blocker.state === 'blocked' && (
                <Modal isOpen={true} onClose={() => blocker.reset && blocker.reset()} size="sm">
                    <div className="text-center">
                        {/* Icon */}
                        <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-red-100 text-red-600 mb-4">
                            <AlertTriangle className="h-8 w-8" />
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-neutral-900 mb-2">Unsaved Changes</h3>

                        {/* Message */}
                        <p className="text-neutral-500 mb-6">You have unsaved changes. What would you like to do?</p>

                        {/* Actions — 3 buttons */}
                        <div className="flex flex-col gap-2">
                            <Button
                                onClick={handleSaveDraftAndLeave}
                                className="w-full bg-red-600 hover:bg-red-700 text-white gap-2"
                            >
                                <Save size={16} />
                                Save Draft & Leave
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => blocker.proceed && blocker.proceed()}
                                className="w-full"
                            >
                                <X size={16} />
                                Discard & Leave
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => blocker.reset && blocker.reset()}
                                className="w-full text-neutral-500"
                            >
                                Stay on Page
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
            {/* ─── Image Crop Modal ──────────────────────────────────────── */}
            <ImageCropModal
                isOpen={cropModalOpen}
                imageSrc={cropImageSrc}
                onClose={() => setCropModalOpen(false)}
                onCropComplete={handleCropComplete}
                fileName={cropFileName}
            />
        </div>
    );
};

export default AdminBlogEditorPage;
