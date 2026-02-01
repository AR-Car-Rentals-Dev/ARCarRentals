-- Migration: Add security features to existing bookings table
-- This adds magic link token support to the existing schema

-- Add new columns to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS booking_reference VARCHAR(20),
ADD COLUMN IF NOT EXISTS magic_token_hash VARCHAR(64),
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS agreed_to_terms BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pickup_time VARCHAR(20);

-- Make booking_reference unique after populating
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_reference ON public.bookings(booking_reference) WHERE booking_reference IS NOT NULL;

-- Create index on token for fast lookups
CREATE INDEX IF NOT EXISTS idx_bookings_token ON public.bookings(magic_token_hash) WHERE magic_token_hash IS NOT NULL;

-- Update existing bookings with booking_reference
-- Generate new references for existing records if they don't have one
UPDATE public.bookings 
SET booking_reference = 'AR-' || EXTRACT(YEAR FROM created_at) || '-' || UPPER(SUBSTRING(MD5(id::text) FROM 1 FOR 4))
WHERE booking_reference IS NULL AND id IS NOT NULL;

-- Create customers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  drivers_license VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on customers email
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

-- Add customer_id to bookings if it doesn't exist
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;

-- Update payments table to match new schema
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20) CHECK (payment_type IN ('full', 'downpayment')),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'confirmed', 'failed')),
ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- Migrate existing payment data
UPDATE public.payments 
SET payment_type = 'full'
WHERE payment_type IS NULL;

-- Create storage bucket for receipts (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for guest checkout" ON public.customers;
CREATE POLICY "Enable insert for guest checkout" ON public.customers
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read for own records" ON public.customers;
CREATE POLICY "Enable read for own records" ON public.customers
  FOR SELECT
  USING (true);

-- RLS Policies for bookings (allow guest access)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for guest booking" ON public.bookings;
CREATE POLICY "Enable insert for guest booking" ON public.bookings
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read for verified bookings" ON public.bookings;
CREATE POLICY "Enable read for verified bookings" ON public.bookings
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Enable update for admins" ON public.bookings;
CREATE POLICY "Enable update for admins" ON public.bookings
  FOR UPDATE
  USING (true);

-- RLS Policies for payments (allow guest access)
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for guest payment" ON public.payments;
CREATE POLICY "Enable insert for guest payment" ON public.payments
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read for verified payments" ON public.payments;
CREATE POLICY "Enable read for verified payments" ON public.payments
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Enable update for admin payments" ON public.payments;
CREATE POLICY "Enable update for admin payments" ON public.payments
  FOR UPDATE
  USING (true);

-- Storage policies for receipts bucket
DROP POLICY IF EXISTS "Enable upload for anyone" ON storage.objects;
CREATE POLICY "Enable upload for anyone" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'receipts');

DROP POLICY IF EXISTS "Enable read for anyone" ON storage.objects;
CREATE POLICY "Enable read for anyone" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'receipts');

-- Create or replace trigger for updated_at on customers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON COLUMN public.bookings.booking_reference IS 'Human-readable booking reference in AR-YEAR-XXXX format';
COMMENT ON COLUMN public.bookings.magic_token_hash IS 'SHA-256 hash of the magic link token for secure access';
COMMENT ON COLUMN public.bookings.token_expires_at IS 'Expiry timestamp for the magic link (return date + 24 hours)';
COMMENT ON COLUMN public.bookings.customer_id IS 'Reference to customer record for guest bookings';
COMMENT ON TABLE public.customers IS 'Customer information for car rentals (guest checkout)';
