-- ============================================
-- CRON JOB: Lead Abandonment Automation
-- ============================================
-- This cron job runs every 10 minutes to:
-- 1. Find PENDING leads older than 60 minutes
-- 2. Mark them as ABANDONED
-- 3. Queue them for abandoned cart email
--
-- Prerequisites:
-- - pg_cron extension must be enabled in Supabase
-- - Run this in Supabase SQL Editor
-- ============================================

-- Enable pg_cron extension (if not already enabled)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================
-- FUNCTION: Process abandoned leads
-- ============================================
CREATE OR REPLACE FUNCTION process_abandoned_leads()
RETURNS TABLE(
  lead_id UUID,
  email VARCHAR,
  lead_name VARCHAR,
  vehicle_name TEXT,
  pickup_date DATE,
  return_date DATE,
  estimated_price NUMERIC
) AS $$
DECLARE
  affected_count INT;
BEGIN
  -- Find and update PENDING leads older than 60 minutes
  -- that haven't been recovered
  WITH abandoned AS (
    UPDATE abandoned_leads
    SET 
      status = 'abandoned',
      automation_status = 'sent',
      automation_sent_at = NOW()
    WHERE 
      status = 'pending'
      AND recovered_booking_id IS NULL
      AND created_at < NOW() - INTERVAL '60 minutes'
      AND automation_status = 'not_sent'
    RETURNING *
  )
  SELECT COUNT(*) INTO affected_count FROM abandoned;
  
  RAISE NOTICE 'Marked % leads as abandoned', affected_count;
  
  -- Return the leads that need emails sent
  RETURN QUERY
  SELECT 
    al.id,
    al.email,
    al.lead_name,
    COALESCE(v.brand || ' ' || v.model, 'Your Selected Vehicle') as vehicle_name,
    al.pickup_date,
    al.return_date,
    al.estimated_price
  FROM abandoned_leads al
  LEFT JOIN vehicles v ON al.vehicle_id = v.id
  WHERE 
    al.status = 'abandoned'
    AND al.automation_status = 'sent'
    AND al.automation_sent_at > NOW() - INTERVAL '1 minute';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CRON SCHEDULE: Run every 10 minutes
-- ============================================
-- NOTE: Uncomment the lines below to enable the cron job
-- The cron will call an edge function to send emails

-- SELECT cron.schedule(
--   'process-abandoned-leads',           -- Job name
--   '*/10 * * * *',                       -- Every 10 minutes
--   $$
--     SELECT * FROM process_abandoned_leads();
--   $$
-- );

-- ============================================
-- ALTERNATIVE: Edge Function Trigger
-- ============================================
-- If you want to trigger an edge function for emails,
-- use this modified approach:

-- 1. Create a webhook/edge function to send emails
-- 2. The cron job marks leads as abandoned
-- 3. A Supabase Realtime listener or webhook picks up changes

-- For immediate testing, you can run:
-- SELECT * FROM process_abandoned_leads();

-- ============================================
-- MANUAL TRIGGER: For testing
-- ============================================
-- Call this to immediately process abandoned leads:
-- SELECT * FROM process_abandoned_leads();

-- ============================================
-- CLEANUP: Remove cron job (if needed)
-- ============================================
-- SELECT cron.unschedule('process-abandoned-leads');

-- ============================================
-- VIEW: Check scheduled jobs
-- ============================================
-- SELECT * FROM cron.job;

-- ============================================
-- VIEW: Check job run history
-- ============================================
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
