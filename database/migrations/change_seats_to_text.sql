-- Migration: Change seats column from integer to text to support ranges
-- This allows storing values like "4-5", "7-8", or single numbers like "5"

-- Step 1: Add new text column
ALTER TABLE vehicles ADD COLUMN seats_text TEXT;

-- Step 2: Copy existing integer values to text column
UPDATE vehicles SET seats_text = seats::TEXT;

-- Step 3: Drop old integer column
ALTER TABLE vehicles DROP COLUMN seats;

-- Step 4: Rename new column to seats
ALTER TABLE vehicles RENAME COLUMN seats_text TO seats;

-- Step 5: Set NOT NULL constraint and default
ALTER TABLE vehicles ALTER COLUMN seats SET NOT NULL;
ALTER TABLE vehicles ALTER COLUMN seats SET DEFAULT '5';

-- Add comment for documentation
COMMENT ON COLUMN vehicles.seats IS 'Number of seats - can be a single number (e.g., "5") or a range (e.g., "4-5", "7-8")';
