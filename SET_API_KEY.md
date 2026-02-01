# 🔑 Setting Resend API Key in Supabase Dashboard

## Problem
The Supabase CLI is showing a permissions error when trying to set secrets via command line.

## Solution: Use Supabase Dashboard (Easier!)

### Step 1: Open Supabase Dashboard
1. Go to https://app.supabase.com
2. Select your project: **dnexspoyhhqflatuyxje**

### Step 2: Navigate to Edge Functions
1. Click **Edge Functions** in the left sidebar
2. Click on **send-booking-email** function
3. Click the **Secrets** tab at the top

### Step 3: Add the Secret
1. Click **Add new secret**
2. Enter:
   - **Name:** `RESEND_API_KEY`
   - **Value:** `re_GSFm3dja_F6nzeQJfSdUKGZzaJKBMek8v`
3. Click **Save**

### Step 4: Test
Go back to your app and try creating a booking again. The email should now work!

---

## Alternative: Command Line (if dashboard doesn't work)

If you need owner permissions, ask the project owner to run:
```powershell
npx supabase login
npx supabase secrets set RESEND_API_KEY=re_GSFm3dja_F6nzeQJfSdUKGZzaJKBMek8v
```

---

## Verify It Worked

After setting the secret, check function logs:
```powershell
npx supabase functions logs send-booking-email --tail
```

You should see:
- ✅ `📧 Sending email to: [customer email]`
- ✅ `✅ Email sent successfully. ID: [message id]`

Instead of:
- ❌ `RESEND_API_KEY not set`
