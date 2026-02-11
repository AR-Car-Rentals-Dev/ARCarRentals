-- Fix RLS Policy for abandoned_leads table
-- This allows anonymous users (public website visitors) to create leads
-- Run this in your Supabase SQL Editor

-- Drop existing policy if it exists (to recreate it)
DROP POLICY IF EXISTS "Anyone can create abandoned leads" ON abandoned_leads;

-- Recreate the policy to allow anonymous inserts
CREATE POLICY "Anyone can create abandoned leads"
  ON abandoned_leads FOR INSERT
  TO anon
  WITH CHECK (true);

-- Also ensure the anon role has INSERT permission
GRANT INSERT ON abandoned_leads TO anon;

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'abandoned_leads' 
  AND policyname = 'Anyone can create abandoned leads';
