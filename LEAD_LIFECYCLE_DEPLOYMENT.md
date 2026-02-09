# Lead Lifecycle Deployment Guide

Follow these steps **in order** to deploy the lead lifecycle system.

---

## 📋 Prerequisites

Make sure you have:
- [x] Supabase CLI installed (`npm install -g supabase`)
- [x] Logged into Supabase CLI (`supabase login`)
- [x] Resend API key set (`supabase secrets set RESEND_API_KEY=re_xxx`)

---

## Step 1: Deploy the Edge Function

Open **PowerShell** in your project folder and run:

```powershell
cd "C:\FMA Studios\ARCarRentals"

# Deploy the updated edge function with abandoned_cart template
supabase functions deploy send-booking-email
```

**Expected output:**
```
Deploying function send-booking-email...
✓ Deployed function send-booking-email
```

---

## Step 2: Create the Cron Job Function

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the SQL from:
   `database/migrations/lead_abandonment_cron.sql`
3. Click **Run**

This creates the `process_abandoned_leads()` function.

---

## Step 3: Enable pg_cron Extension

In **SQL Editor**, run:

```sql
-- Enable pg_cron (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

---

## Step 4: Schedule the Cron Job

In **SQL Editor**, run:

```sql
SELECT cron.schedule(
  'process-abandoned-leads',    -- Job name
  '*/10 * * * *',               -- Every 10 minutes
  $$SELECT * FROM process_abandoned_leads();$$
);
```

---

## Step 5: Verify Cron Job is Active

In **SQL Editor**, run:

```sql
-- Check scheduled jobs
SELECT * FROM cron.job;

-- Check recent job runs
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;
```

You should see `process-abandoned-leads` in the list.

---

## Step 6: Test the Flow (Manual)

### A. Test Lead Capture
1. Go to booking page
2. Fill in name, email, phone  
3. Check browser console for: `✅ Lead saved successfully`

### B. Test Lead Recovery  
1. Complete a booking with payment
2. Check Supabase table `abandoned_leads`
3. Lead status should be `recovered`

### C. Test Cron Job (Manual Trigger)
```sql
-- In SQL Editor, manually run the function
SELECT * FROM process_abandoned_leads();
```

---

## ✅ Deployment Complete Checklist

| Step | Action | Status |
|------|--------|--------|
| 1 | Edge function deployed | ⬜ |
| 2 | Cron function created | ⬜ |
| 3 | pg_cron enabled | ⬜ |
| 4 | Cron job scheduled | ⬜ |
| 5 | Verified cron is active | ⬜ |
| 6 | Tested lead flow | ⬜ |

---

## 🔧 Troubleshooting

### Edge function deployment fails
```powershell
# Check logs
supabase functions logs send-booking-email --tail
```

### Cron job not running
```sql
-- Check if pg_cron is enabled
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- Check job errors
SELECT * FROM cron.job_run_details WHERE status = 'failed';
```

### Leads not being captured
1. Check browser console for errors
2. Verify `leads_with_vehicle` view exists
3. Check RLS policies on `abandoned_leads` table

---

## 📁 Files Updated

| File | Purpose |
|------|---------|
| `src/services/leadsService.ts` | Lead capture + session storage |
| `src/pages/BrowseVehicles/CheckoutPage.tsx` | Mark lead recovered on payment |
| `src/pages/AdminLeadsPage.tsx` | Filter out recovered leads |
| `supabase/functions/send-booking-email/index.ts` | Abandoned cart email template |
| `database/migrations/lead_abandonment_cron.sql` | Cron job to mark abandoned leads |
