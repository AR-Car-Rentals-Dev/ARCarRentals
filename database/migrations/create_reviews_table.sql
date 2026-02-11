-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    photo_url TEXT,
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow public read access to all reviews
CREATE POLICY "Public reviews are viewable by everyone" 
ON public.reviews FOR SELECT 
USING (true);

-- Allow admins/staff to insert/update/delete reviews
-- Assuming 'authenticated' role for now, ideally strictly check for admin/staff
CREATE POLICY "Staff can insert reviews" 
ON public.reviews FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Staff can update reviews" 
ON public.reviews FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Staff can delete reviews" 
ON public.reviews FOR DELETE 
TO authenticated 
USING (true);

-- Create storage bucket for review photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('review-photos', 'review-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'review-photos');

CREATE POLICY "Staff Upload Access" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'review-photos');
