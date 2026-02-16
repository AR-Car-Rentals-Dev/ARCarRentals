import { supabase } from './supabase';

export interface BlogPost {
  id: string;
  title: string;
  slug: { current: string };
  publishedAt: string | null;
  mainImage: string | null;
  excerpt: string;
  body: string; // HTML string
  author: string;
  categories: string[];
  isPublished?: boolean; // Optional for compatibility
}

export type BlogPostSummary = BlogPost;

// --- Image Upload ---

/**
 * Uploads an image file to the 'blog-images' bucket.
 * Returns the public URL of the uploaded image.
 */
export const uploadBlogImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('blog-images')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage.from('blog-images').getPublicUrl(filePath);
  return data.publicUrl;
};

// --- CRUD Operations ---

export const getAllPosts = async (): Promise<BlogPostSummary[]> => {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }

  // Map Supabase data to BlogPost interface
  return data.map((d: any) => mapSupabaseToBlogPost(d));
};

export const getPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.warn(`Error fetching post by slug "${slug}":`, error);
    return null;
  }

  return mapSupabaseToBlogPost(data);
};

export const getPostById = async (id: string): Promise<BlogPost | null> => {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.warn(`Error fetching post by ID "${id}":`, error);
    return null;
  }

  return mapSupabaseToBlogPost(data);
};

export const createPost = async (post: Omit<BlogPost, 'id' | 'publishedAt'>): Promise<BlogPost> => {
  const newPost = {
    title: post.title,
    slug: post.slug.current,
    excerpt: post.excerpt,
    body: post.body,
    author: post.author,
    category: post.categories[0] || 'Uncategorized', // Schema uses single string for now
    main_image: post.mainImage,
    is_published: false,
    // published_at is managed by DB or update logic
  };

  const { data, error } = await supabase
    .from('blogs')
    .insert(newPost)
    .select()
    .single();

  if (error) {
    console.error('Error creating post:', error);
    throw error;
  }

  return mapSupabaseToBlogPost(data);
};

export const updatePost = async (id: string, updates: Partial<BlogPost>): Promise<BlogPost> => {
  // Map updates to Supabase schema columns
  const dbUpdates: any = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.slug !== undefined) dbUpdates.slug = updates.slug.current;
  if (updates.excerpt !== undefined) dbUpdates.excerpt = updates.excerpt;
  if (updates.body !== undefined) dbUpdates.body = updates.body;
  if (updates.author !== undefined) dbUpdates.author = updates.author;
  if (updates.categories !== undefined) dbUpdates.category = updates.categories[0];
  if (updates.mainImage !== undefined) dbUpdates.main_image = updates.mainImage;
  if (updates.isPublished !== undefined) {
    dbUpdates.is_published = updates.isPublished;
    if (updates.isPublished) {
      dbUpdates.published_at = new Date().toISOString();
    } else {
      dbUpdates.published_at = null;
    }
  }

  const { data, error } = await supabase
    .from('blogs')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating post:', error);
    throw error;
  }

  return mapSupabaseToBlogPost(data);
};

export const deletePost = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('blogs').delete().eq('id', id);
  if (error) {
    console.error('Error deleting post:', error);
    return false;
  }
  return true;
};

// --- Helper Functions ---

const mapSupabaseToBlogPost = (data: any): BlogPost => {
  return {
    id: data.id,
    title: data.title,
    slug: { current: data.slug },
    publishedAt: data.published_at || data.created_at,
    mainImage: data.main_image,
    excerpt: data.excerpt
      ? data.excerpt
      : data.body ? sanitizeHtml(data.body).substring(0, 150) + '...' : '',
    body: data.body,
    author: data.author || 'Anonymous',
    categories: data.category ? [data.category] : [],
    isPublished: data.is_published
  };
};

const sanitizeHtml = (html: string): string => {
  // Simple regex strip for excerpt generation (not for security)
  return html.replace(/<[^>]*>?/gm, '');
};
