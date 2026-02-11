-- Add review_url column to reviews table
ALTER TABLE reviews
ADD COLUMN review_url TEXT;

-- Update comment on table
COMMENT ON COLUMN reviews.review_url IS 'External link to the original review (e.g., Google Maps, Facebook)';
