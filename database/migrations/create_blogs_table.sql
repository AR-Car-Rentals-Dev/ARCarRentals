-- Create the blogs table
create table if not exists public.blogs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  excerpt text,
  body text,
  author text,
  category text,
  main_image text,
  is_published boolean default false,
  published_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.blogs enable row level security;

-- Create policies
-- Public can view published blogs
create policy "Public blogs are viewable by everyone"
  on public.blogs for select
  using ( is_published = true );

-- Admins (authenticated users) can do everything
create policy "Admins can manage all blogs"
  on public.blogs for all
  using ( auth.role() = 'authenticated' );

-- Create trigger for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_updated_at
  before update on public.blogs
  for each row
  execute procedure public.handle_updated_at();

-- Create Storage Bucket for Blog Images
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

-- Storage Policies
create policy "Blog images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'blog-images' );

create policy "Admins can upload blog images"
  on storage.objects for insert
  with check ( bucket_id = 'blog-images' and auth.role() = 'authenticated' );

create policy "Admins can update blog images"
  on storage.objects for update
  using ( bucket_id = 'blog-images' and auth.role() = 'authenticated' );

create policy "Admins can delete blog images"
  on storage.objects for delete
  using ( bucket_id = 'blog-images' and auth.role() = 'authenticated' );
