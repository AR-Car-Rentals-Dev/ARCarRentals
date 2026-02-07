-- Migration: Add vehicle_images table for multiple image support
-- This allows vehicles to have multiple images with one designated as primary

-- Create vehicle_images table
CREATE TABLE IF NOT EXISTS public.vehicle_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  vehicle_id uuid NOT NULL,
  image_url text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT vehicle_images_pkey PRIMARY KEY (id),
  CONSTRAINT vehicle_images_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id ON public.vehicle_images(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_primary ON public.vehicle_images(vehicle_id, is_primary) WHERE is_primary = true;

-- Enable RLS on vehicle_images
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access on vehicle_images"
  ON public.vehicle_images
  FOR SELECT
  TO public
  USING (true);

-- Create policy for authenticated users to manage vehicle images
CREATE POLICY "Allow authenticated users to manage vehicle_images"
  ON public.vehicle_images
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to ensure only one primary image per vehicle
CREATE OR REPLACE FUNCTION ensure_single_primary_image()
RETURNS TRIGGER AS $$
BEGIN
  -- If the new/updated image is marked as primary
  IF NEW.is_primary = true THEN
    -- Set all other images for this vehicle to non-primary
    UPDATE public.vehicle_images
    SET is_primary = false
    WHERE vehicle_id = NEW.vehicle_id
      AND id != NEW.id
      AND is_primary = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for ensuring single primary image
DROP TRIGGER IF EXISTS trigger_ensure_single_primary_image ON public.vehicle_images;
CREATE TRIGGER trigger_ensure_single_primary_image
  BEFORE INSERT OR UPDATE ON public.vehicle_images
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_primary_image();

-- Function to set first image as primary if no primary exists
CREATE OR REPLACE FUNCTION set_default_primary_image()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is the first image for the vehicle, make it primary
  IF NOT EXISTS (
    SELECT 1 FROM public.vehicle_images 
    WHERE vehicle_id = NEW.vehicle_id AND is_primary = true
  ) THEN
    NEW.is_primary := true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for setting default primary
DROP TRIGGER IF EXISTS trigger_set_default_primary_image ON public.vehicle_images;
CREATE TRIGGER trigger_set_default_primary_image
  BEFORE INSERT ON public.vehicle_images
  FOR EACH ROW
  EXECUTE FUNCTION set_default_primary_image();

-- Migrate existing vehicle images to the new table
INSERT INTO public.vehicle_images (vehicle_id, image_url, is_primary, display_order)
SELECT id, image_url, true, 0
FROM public.vehicles
WHERE image_url IS NOT NULL AND image_url != '';

-- Note: The image_url column on vehicles table will be kept for backward compatibility
-- and will be updated via a trigger when the primary image changes

-- Function to sync primary image back to vehicles table
CREATE OR REPLACE FUNCTION sync_vehicle_primary_image()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = true THEN
    UPDATE public.vehicles
    SET image_url = NEW.image_url,
        updated_at = now()
    WHERE id = NEW.vehicle_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync primary image
DROP TRIGGER IF EXISTS trigger_sync_vehicle_primary_image ON public.vehicle_images;
CREATE TRIGGER trigger_sync_vehicle_primary_image
  AFTER INSERT OR UPDATE ON public.vehicle_images
  FOR EACH ROW
  WHEN (NEW.is_primary = true)
  EXECUTE FUNCTION sync_vehicle_primary_image();

COMMENT ON TABLE public.vehicle_images IS 'Stores multiple images for vehicles. First image (is_primary=true) is displayed as the main image.';
COMMENT ON COLUMN public.vehicle_images.is_primary IS 'Indicates if this is the primary/main image shown in listings';
COMMENT ON COLUMN public.vehicle_images.display_order IS 'Order in which images are displayed (0 = first)';
