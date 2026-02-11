-- ============================================
-- STEP 1: Check current RLS policies
-- ============================================
-- Run this first to see what policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'abandoned_leads'
ORDER BY policyname;

-- ============================================
-- STEP 2: Check table permissions
-- ============================================
-- See what permissions the 'anon' role has
SELECT 
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'abandoned_leads'
  AND grantee = 'anon';

-- ============================================
-- STEP 3: Fix the RLS policy
-- ============================================
-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Anyone can create abandoned leads" ON abandoned_leads;
DROP POLICY IF EXISTS "Authenticated users can insert leads" ON abandoned_leads;
DROP POLICY IF EXISTS "Authenticated users can view leads" ON abandoned_leads;
DROP POLICY IF EXISTS "Authenticated users can update leads" ON abandoned_leads;
DROP POLICY IF EXISTS "Authenticated users can delete leads" ON abandoned_leads;

-- Recreate policies with correct permissions
-- 1. Allow anonymous users to INSERT (for public lead capture)
CREATE POLICY "anon_insert_leads"
  ON abandoned_leads 
  FOR INSERT 
  TO anon
  WITH CHECK (true);

-- 2. Allow authenticated users (admins) to do everything
CREATE POLICY "authenticated_all_leads"
  ON abandoned_leads 
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- STEP 4: Grant permissions
-- ============================================
-- Ensure anon role has INSERT permission
GRANT INSERT ON abandoned_leads TO anon;

-- Ensure authenticated role has all permissions
GRANT ALL ON abandoned_leads TO authenticated;

-- ============================================
-- STEP 5: Verify the fix
-- ============================================
-- Check policies again
SELECT 
  policyname,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'abandoned_leads'
ORDER BY policyname;

-- Check permissions again
SELECT 
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'abandoned_leads'
  AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;
