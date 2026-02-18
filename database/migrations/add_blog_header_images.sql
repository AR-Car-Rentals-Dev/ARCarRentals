-- Add header_images column to blogs table
alter table public.blogs 
add column if not exists header_images text[];

-- Comment on column
comment on column public.blogs.header_images is 'Array of image URLs for the blog post header carousel';
