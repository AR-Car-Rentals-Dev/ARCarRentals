-- ============================================
-- NUCLEAR OPTION: Complete RLS Reset
-- Use this if the previous fix didn't work
-- ============================================

-- Step 1: Disable RLS temporarily
ALTER TABLE abandoned_leads DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies (including any hidden ones)
DO $$ 
DECLARE 
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE tablename = 'abandoned_leads'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON abandoned_leads', pol.policyname);
  END LOOP;
END $$;

-- Step 3: Re-enable RLS
ALTER TABLE abandoned_leads ENABLE ROW LEVEL SECURITY;

-- Step 4: Create clean policies
CREATE POLICY "anon_can_insert_leads"
  ON abandoned_leads 
  FOR INSERT 
  TO anon
  WITH CHECK (true);

CREATE POLICY "authenticated_full_access"
  ON abandoned_leads 
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Step 5: Grant permissions explicitly
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON abandoned_leads TO anon;
GRANT ALL ON abandoned_leads TO authenticated;

-- Step 6: Verify the fix
SELECT 
  'Policies Created:' as status,
  policyname,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'abandoned_leads'
UNION ALL
SELECT 
  'Permissions Granted:' as status,
  grantee as policyname,
  privilege_type as roles,
  '' as cmd
FROM information_schema.table_privileges
WHERE table_name = 'abandoned_leads'
  AND grantee IN ('anon', 'authenticated')
ORDER BY status, policyname;
