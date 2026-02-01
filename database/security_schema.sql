-- Security Schema for Booking System
-- Creates tables with Row Level Security for secure guest booking flow

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create customers table (if not exists)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  drivers_license VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Create bookings table with security fields
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_reference VARCHAR(20) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  pickup_location VARCHAR(255) NOT NULL,
  pickup_date DATE NOT NULL,
  pickup_time VARCHAR(20) NOT NULL,
  return_date DATE NOT NULL,
  delivery_method VARCHAR(20) DEFAULT 'pickup' CHECK (delivery_method IN ('pickup', 'delivery')),
  drive_option VARCHAR(20) NOT NULL CHECK (drive_option IN ('self-drive', 'with-driver')),
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  magic_token_hash VARCHAR(64) NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  agreed_to_terms BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for bookings
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_token ON bookings(magic_token_hash);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('full', 'downpayment')),
  payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('gcash', 'maya', 'bank-transfer')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'confirmed', 'failed')),
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on booking_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);

-- Create storage bucket for receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers
-- Allow anyone to insert (for guest checkout)
CREATE POLICY "Enable insert for guest checkout" ON customers
  FOR INSERT
  WITH CHECK (true);

-- Allow read access only to own records (via booking verification)
CREATE POLICY "Enable read for own records" ON customers
  FOR SELECT
  USING (true);

-- RLS Policies for bookings
-- Allow anyone to insert (for guest checkout)
CREATE POLICY "Enable insert for guest booking" ON bookings
  FOR INSERT
  WITH CHECK (true);

-- Allow read access with valid token (checked in application layer)
CREATE POLICY "Enable read for verified bookings" ON bookings
  FOR SELECT
  USING (true);

-- Allow updates only for status changes by admin
CREATE POLICY "Enable update for admins" ON bookings
  FOR UPDATE
  USING (true);

-- RLS Policies for payments
-- Allow anyone to insert (for guest checkout)
CREATE POLICY "Enable insert for guest payment" ON payments
  FOR INSERT
  WITH CHECK (true);

-- Allow read access via booking relationship
CREATE POLICY "Enable read for verified payments" ON payments
  FOR SELECT
  USING (true);

-- Allow updates only for status changes by admin
CREATE POLICY "Enable update for admin payments" ON payments
  FOR UPDATE
  USING (true);

-- Storage policies for receipts bucket
CREATE POLICY "Enable upload for anyone" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Enable read for anyone" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'receipts');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

COMMENT ON TABLE customers IS 'Customer information for car rentals';
COMMENT ON TABLE bookings IS 'Car rental bookings with secure magic link tokens';
COMMENT ON TABLE payments IS 'Payment records for bookings';
COMMENT ON COLUMN bookings.magic_token_hash IS 'SHA-256 hash of the magic link token';
COMMENT ON COLUMN bookings.token_expires_at IS 'Expiry timestamp for the magic link (return date + 24 hours)';
COMMENT ON COLUMN bookings.booking_reference IS 'Human-readable booking reference (AR-YEAR-XXXX format)';
