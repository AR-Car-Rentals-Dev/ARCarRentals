-- Migration: Simplify vehicles table
-- Date: 2024
-- Description: 
--   1. Remove unnecessary columns from vehicles table
--   2. Change image to single image_url
--   3. Update status enum values
--   4. Drop customers and drivers related tables (optional)

-- ============================================
-- Step 1: Drop columns that are no longer needed
-- ============================================

-- Remove year column
ALTER TABLE vehicles 
DROP COLUMN IF EXISTS year;

-- Remove license_plate column
ALTER TABLE vehicles 
DROP COLUMN IF EXISTS license_plate;

-- Remove doors column
ALTER TABLE vehicles 
DROP COLUMN IF EXISTS doors;

-- Remove luggage_capacity column
ALTER TABLE vehicles 
DROP COLUMN IF EXISTS luggage_capacity;

-- Remove price_per_week column
ALTER TABLE vehicles 
DROP COLUMN IF EXISTS price_per_week;

-- Remove price_per_month column
ALTER TABLE vehicles 
DROP COLUMN IF EXISTS price_per_month;

-- Remove deposit_amount column (static value)
ALTER TABLE vehicles 
DROP COLUMN IF EXISTS deposit_amount;

-- Remove mileage column
ALTER TABLE vehicles 
DROP COLUMN IF EXISTS mileage;

-- Remove location column
ALTER TABLE vehicles 
DROP COLUMN IF EXISTS location;

-- Remove average_rating column
ALTER TABLE vehicles 
DROP COLUMN IF EXISTS average_rating;

-- Remove total_reviews column
ALTER TABLE vehicles 
DROP COLUMN IF EXISTS total_reviews;

-- Remove images array column (will use single image_url)
ALTER TABLE vehicles 
DROP COLUMN IF EXISTS images;

-- ============================================
-- Step 2: Ensure required columns exist
-- ============================================

-- Ensure image_url column exists for single image
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- If thumbnail exists, copy to image_url then drop thumbnail
UPDATE vehicles SET image_url = thumbnail WHERE image_url IS NULL AND thumbnail IS NOT NULL;

-- ============================================
-- Step 3: Update status values
-- ============================================
-- Status options: 'available', 'not_available', 'on_maintenance'

-- Update existing status values
UPDATE vehicles SET status = 'not_available' WHERE status = 'rented';
UPDATE vehicles SET status = 'on_maintenance' WHERE status = 'maintenance';

-- ============================================
-- Step 4: Ensure proper column types
-- ============================================

-- Make sure essential columns exist with proper types
-- brand: VARCHAR(100)
-- model: VARCHAR(100)  
-- type: VARCHAR(50) - sedan, suv, van, etc.
-- transmission: VARCHAR(20) - automatic, manual
-- fuel_type: VARCHAR(20) - gasoline, diesel, hybrid, electric
-- seats: INTEGER
-- color: VARCHAR(50)
-- features: TEXT[] (array)
-- image_url: TEXT
-- price_per_day: NUMERIC(10,2)
-- status: VARCHAR(20) - available, not_available, on_maintenance
-- description: TEXT

-- ============================================
-- Verify final table structure
-- ============================================
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'vehicles'
ORDER BY ordinal_position;

-- ============================================
-- NOTES:
-- ============================================
-- 
-- Simplified Vehicle Schema (uses existing vehicle_categories table):
-- - brand (required)
-- - model (required)
-- - category_id (references vehicle_categories table)
-- - transmission (automatic, manual)
-- - fuel_type (gasoline, diesel, hybrid, electric)
-- - seats (number)
-- - color (optional)
-- - features (array/jsonb of strings)
-- - image_url (single image)
-- - thumbnail (kept for backward compatibility)
-- - price_per_day (required)
-- - status (available, rented, maintenance)
-- - description (optional)
-- - is_featured (boolean)
--
-- Removed columns:
-- - year, license_plate, doors, luggage_capacity
-- - price_per_week, price_per_month, deposit_amount
-- - mileage, location, average_rating, total_reviews
-- ============================================
