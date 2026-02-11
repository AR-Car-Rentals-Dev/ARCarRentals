-- ============================================
-- DIAGNOSTIC: Check what's blocking the insert
-- Run this FIRST to see the current state
-- ============================================

-- 1. Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename = 'abandoned_leads';

-- 2. Check ALL current policies
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
ORDER BY policyname;

-- 3. Check table permissions for anon role
SELECT 
  table_schema,
  table_name,
  privilege_type,
  grantee
FROM information_schema.table_privileges
WHERE table_name = 'abandoned_leads'
  AND grantee IN ('anon', 'authenticated', 'public')
ORDER BY grantee, privilege_type;

-- 4. Check if anon role exists and is configured
SELECT rolname, rolcanlogin 
FROM pg_roles 
WHERE rolname IN ('anon', 'authenticated', 'authenticator');
