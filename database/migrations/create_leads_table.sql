-- Migration: Create abandoned_leads table for Leads Management Dashboard
-- This table connects with the existing vehicles and customers tables
-- Run this in Supabase SQL Editor

-- Create the abandoned_leads table
CREATE TABLE IF NOT EXISTS abandoned_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Lead contact information (can link to existing customer if found)
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  lead_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  
  -- Vehicle interest (links to existing vehicles table)
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  
  -- Booking details (matches bookings table structure)
  pickup_location VARCHAR(255),
  dropoff_location VARCHAR(255),
  pickup_date DATE,
  pickup_time VARCHAR(10),
  return_date DATE,
  rental_days INT4,
  estimated_price NUMERIC,
  drive_option VARCHAR(20), -- 'self-drive' or 'with-driver'
  
  -- If lead was recovered, link to the booking that was created
  recovered_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  
  -- Abandonment tracking
  last_step VARCHAR(50) NOT NULL DEFAULT 'date_selection', -- 'date_selection', 'renter_info', 'payment'
  drop_off_timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Automation status for follow-up emails
  automation_status VARCHAR(20) DEFAULT 'not_sent', -- 'not_sent', 'sent', 'opened', 'clicked'
  automation_sent_at TIMESTAMPTZ,
  automation_opened_at TIMESTAMPTZ,
  automation_clicked_at TIMESTAMPTZ,
  
  -- Lead status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'recovered', 'expired'
  
  -- Admin notes
  admin_notes TEXT,
  
  -- Timestamps (matches other tables)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries and foreign key relationships
CREATE INDEX IF NOT EXISTS idx_leads_status ON abandoned_leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON abandoned_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_last_step ON abandoned_leads(last_step);
CREATE INDEX IF NOT EXISTS idx_leads_vehicle_id ON abandoned_leads(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_leads_customer_id ON abandoned_leads(customer_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON abandoned_leads(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_leads_updated_at ON abandoned_leads;
CREATE TRIGGER trigger_leads_updated_at
  BEFORE UPDATE ON abandoned_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_leads_updated_at();

-- Enable Row Level Security
ALTER TABLE abandoned_leads ENABLE ROW LEVEL SECURITY;

-- Simple RLS Policies (authenticated users can manage leads - admin access controlled via app routing)
CREATE POLICY "Authenticated users can view leads"
  ON abandoned_leads FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert leads"
  ON abandoned_leads FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update leads"
  ON abandoned_leads FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete leads"
  ON abandoned_leads FOR DELETE
  TO authenticated
  USING (true);

-- Allow anonymous insert for tracking abandonments (public users abandoning bookings)
CREATE POLICY "Anyone can create abandoned leads"
  ON abandoned_leads FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create a view that joins with vehicles for easy querying
CREATE OR REPLACE VIEW leads_with_vehicle AS
SELECT 
  al.*,
  v.brand AS vehicle_brand,
  v.model AS vehicle_model,
  v.image_url AS vehicle_image,
  v.price_per_day AS vehicle_price_per_day,
  CONCAT(v.brand, ' ', v.model) AS vehicle_name,
  c.full_name AS customer_full_name
FROM abandoned_leads al
LEFT JOIN vehicles v ON al.vehicle_id = v.id
LEFT JOIN customers c ON al.customer_id = c.id;

-- Grant necessary permissions
GRANT ALL ON abandoned_leads TO authenticated;
GRANT INSERT ON abandoned_leads TO anon;
GRANT SELECT ON leads_with_vehicle TO authenticated;

-- ============================================
-- SAMPLE DATA (using existing vehicle IDs if available)
-- ============================================

-- Insert sample leads with vehicle references
INSERT INTO abandoned_leads (
  lead_name, email, phone, 
  vehicle_id,
  pickup_location, dropoff_location,
  pickup_date, return_date, rental_days,
  estimated_price, drive_option,
  last_step, status, automation_status, 
  drop_off_timestamp
)
SELECT 
  'Matt Alexius Merano', 
  'mattmerano12@gmail.com', 
  '+63 1213212312',
  (SELECT id FROM vehicles LIMIT 1),
  'Lapu-Lapu City', 'Lapu-Lapu City',
  '2026-02-10'::date, '2026-02-12'::date, 2,
  8600.00, 'self-drive',
  'payment', 'pending', 'not_sent',
  NOW() - INTERVAL '2 hours'
WHERE NOT EXISTS (SELECT 1 FROM abandoned_leads WHERE email = 'mattmerano12@gmail.com');

INSERT INTO abandoned_leads (
  lead_name, email, phone, 
  vehicle_id,
  pickup_location, dropoff_location,
  pickup_date, return_date, rental_days,
  estimated_price, drive_option,
  last_step, status, automation_status, 
  drop_off_timestamp, automation_sent_at
)
SELECT 
  'John Smith', 
  'john.smith@corp.com', 
  '+63 9171234567',
  (SELECT id FROM vehicles OFFSET 1 LIMIT 1),
  'Cebu City', 'Cebu City',
  '2026-02-15'::date, '2026-02-17'::date, 2,
  9200.00, 'with-driver',
  'renter_info', 'pending', 'sent',
  NOW() - INTERVAL '5 hours',
  NOW() - INTERVAL '4 hours'
WHERE NOT EXISTS (SELECT 1 FROM abandoned_leads WHERE email = 'john.smith@corp.com');

INSERT INTO abandoned_leads (
  lead_name, email, phone, 
  pickup_location, dropoff_location,
  pickup_date, return_date, rental_days,
  estimated_price, drive_option,
  last_step, status, automation_status, 
  drop_off_timestamp
)
SELECT 
  'Ana Lopez', 
  'ana.lopez@yahoo.com', 
  '+63 9998765432',
  'Mandaue City', 'Mandaue City',
  '2026-02-08'::date, '2026-02-09'::date, 1,
  4650.00, 'self-drive',
  'date_selection', 'expired', 'not_sent',
  NOW() - INTERVAL '1 day'
WHERE NOT EXISTS (SELECT 1 FROM abandoned_leads WHERE email = 'ana.lopez@yahoo.com');

INSERT INTO abandoned_leads (
  lead_name, email, phone, 
  vehicle_id,
  pickup_location, dropoff_location,
  pickup_date, return_date, rental_days,
  estimated_price, drive_option,
  last_step, status, automation_status, 
  drop_off_timestamp, automation_sent_at, automation_opened_at, automation_clicked_at,
  admin_notes
)
SELECT 
  'Robert Chen', 
  'rob.chen@gmail.com', 
  '+63 9221239876',
  (SELECT id FROM vehicles OFFSET 2 LIMIT 1),
  'Talisay City', 'AR Car Rentals Office',
  '2026-02-20'::date, '2026-02-22'::date, 2,
  10800.00, 'self-drive',
  'payment', 'recovered', 'clicked',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '47 hours',
  NOW() - INTERVAL '46 hours',
  NOW() - INTERVAL '45 hours',
  'Successfully converted after discount offer.'
WHERE NOT EXISTS (SELECT 1 FROM abandoned_leads WHERE email = 'rob.chen@gmail.com');
