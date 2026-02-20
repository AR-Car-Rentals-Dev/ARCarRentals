-- Migration: Add late_return_fee_per_hour to vehicle_categories
-- Description: Adds a per-hour late return fee column to vehicle_categories table.
--              Each category has a different rate (Sedan < MPV < SUV < Van).
-- Date: 2026

-- ============================================
-- 1. Add column to vehicle_categories
-- ============================================
ALTER TABLE vehicle_categories
ADD COLUMN IF NOT EXISTS late_return_fee_per_hour DECIMAL(10,2) DEFAULT 200.00;

COMMENT ON COLUMN vehicle_categories.late_return_fee_per_hour
  IS 'Hourly fee charged when a renter returns the vehicle past the agreed return time';

-- ============================================
-- 2. Set fees per category name
-- ============================================
UPDATE vehicle_categories
SET late_return_fee_per_hour = 200.00
WHERE LOWER(name) = 'sedan';

UPDATE vehicle_categories
SET late_return_fee_per_hour = 250.00
WHERE LOWER(name) IN ('multi-purpose vehicle', 'mpv');

UPDATE vehicle_categories
SET late_return_fee_per_hour = 300.00
WHERE LOWER(name) = 'suv';

UPDATE vehicle_categories
SET late_return_fee_per_hour = 350.00
WHERE LOWER(name) = 'van';

-- ============================================
-- 3. Verification (optional - run to confirm)
-- ============================================
SELECT id, name, late_return_fee_per_hour
FROM vehicle_categories
ORDER BY late_return_fee_per_hour;
