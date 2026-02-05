-- Migration: Add Refund Workflow Support to Bookings
-- Description: Adds columns to support the refund workflow with statuses:
--              cancelled (fake receipt/no payment), 
--              refund_pending (valid payment, needs refund),
--              refunded (money returned)

-- Add new columns to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS refund_status TEXT DEFAULT 'none' CHECK (refund_status IN ('none', 'pending', 'completed')),
ADD COLUMN IF NOT EXISTS refund_reference_id TEXT,
ADD COLUMN IF NOT EXISTS refund_proof_url TEXT;

-- Add comment to document the columns
COMMENT ON COLUMN bookings.cancellation_reason IS 'Reason provided by admin when declining/cancelling a booking';
COMMENT ON COLUMN bookings.refund_status IS 'Status of refund: none (no refund needed), pending (refund initiated), completed (refund processed)';
COMMENT ON COLUMN bookings.refund_reference_id IS 'Reference number from payment provider (e.g., GCash Ref #) for the refund transaction';
COMMENT ON COLUMN bookings.refund_proof_url IS 'URL to the uploaded refund receipt/proof screenshot';

-- Update booking_status to support new statuses
-- Drop the old constraint and add a new one with the new statuses
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_booking_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_booking_status_check 
  CHECK (booking_status IN ('pending', 'confirmed', 'cancelled', 'completed', 'refund_pending', 'refunded'));

-- Create an index for faster queries on refund_status
CREATE INDEX IF NOT EXISTS idx_bookings_refund_status ON bookings(refund_status) WHERE refund_status != 'none';

-- Create an index for faster queries on booking_status with refund statuses
CREATE INDEX IF NOT EXISTS idx_bookings_status_refund ON bookings(booking_status, refund_status);
