-- Migration: Remove notes and payment_status columns from bookings table
-- Run this in Supabase SQL Editor

-- Step 1: Remove notes column
ALTER TABLE bookings DROP COLUMN IF EXISTS notes;

-- Step 2: Remove payment_status column  
ALTER TABLE bookings DROP COLUMN IF EXISTS payment_status;

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;
