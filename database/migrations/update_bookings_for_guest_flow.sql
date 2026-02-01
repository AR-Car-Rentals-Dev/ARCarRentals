-- Migration: Update bookings table for guest booking flow
-- Date: 2024
-- Description: 
--   1. Make user_id nullable to allow guest bookings
--   2. Remove customer_address column (no longer collected)
--   3. Remove destination column (no longer collected)
--   4. Remove number_of_passengers column (no longer collected)
--   5. Add location_cost column for pickup/delivery charges
--   6. Add driver_cost column for driver charges

-- ============================================
-- Step 1: Make user_id nullable (if not already)
-- ============================================
ALTER TABLE bookings 
ALTER COLUMN user_id DROP NOT NULL;

-- ============================================
-- Step 2: Drop deprecated columns
-- ============================================

-- Drop customer_address column (replaced by location dropdown)
ALTER TABLE bookings 
DROP COLUMN IF EXISTS customer_address;

-- Drop destination column (no longer needed)
ALTER TABLE bookings 
DROP COLUMN IF EXISTS destination;

-- Drop number_of_passengers column (no longer needed)
ALTER TABLE bookings 
DROP COLUMN IF EXISTS number_of_passengers;

-- ============================================
-- Step 3: Add new cost tracking columns
-- ============================================

-- Add location_cost column for pickup/delivery charges
-- Values: Lapu-Lapu (600), Mandaue (700), Cebu (900)
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS location_cost NUMERIC(10, 2) DEFAULT 0;

-- Add driver_cost column for driver charges
-- Values: 1000 per day (12 hours), 150 per exceeding hour
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS driver_cost NUMERIC(10, 2) DEFAULT 0;

-- Add pickup_delivery_location column to store the selected location
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS pickup_delivery_location VARCHAR(50);

-- ============================================
-- Step 4: Update RLS policies for guest bookings
-- ============================================

-- Drop existing policies if they block guest bookings
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can insert their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view own or guest bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can update bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can update own bookings" ON bookings;

-- Create new policies that allow guest bookings
-- Allow anyone to insert bookings (for guest bookings)
CREATE POLICY "Anyone can create bookings" ON bookings
    FOR INSERT
    WITH CHECK (true);

-- Allow users to view their own bookings, or anyone can view guest bookings
CREATE POLICY "Users can view own or guest bookings" ON bookings
    FOR SELECT
    USING (
        auth.uid() = user_id 
        OR user_id IS NULL -- Guest bookings can be viewed by anyone
    );

-- Allow authenticated users to update their own bookings
CREATE POLICY "Authenticated users can update own bookings" ON bookings
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Step 5: Update existing records (optional cleanup)
-- ============================================

-- Set default values for new columns on existing records
UPDATE bookings 
SET 
    location_cost = 0,
    driver_cost = 0
WHERE location_cost IS NULL OR driver_cost IS NULL;

-- ============================================
-- NOTES:
-- ============================================
-- 
-- Booking Flow Changes:
-- 1. Customers no longer need an account to book
-- 2. Address replaced with pickup/delivery location dropdown
-- 3. Destination and number_of_passengers removed from form
-- 4. Location costs: Lapu-Lapu (₱600), Mandaue (₱700), Cebu (₱900)
-- 5. Driver costs: ₱1,000/day (12hrs), ₱150/exceeding hour
-- 
-- The rent_end_date is still stored but not displayed in form
-- (calculated automatically from start date + rental days)
-- 
-- Total price calculation:
--   total_price = (vehicle_price_per_day * rental_days) + location_cost + driver_cost
-- ============================================

-- Verify changes
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'bookings'
ORDER BY ordinal_position;
