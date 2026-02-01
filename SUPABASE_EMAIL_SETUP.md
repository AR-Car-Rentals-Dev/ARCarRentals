# Supabase Edge Functions Email Setup

This guide will help you set up email sending using Supabase Edge Functions (easiest option since you're already using Supabase).

## Why Supabase Edge Functions?

✅ Already using Supabase for database
✅ Free tier includes 500K function invocations/month
✅ No separate backend server needed
✅ Works with your existing Supabase project
✅ Easy to deploy and test

## Prerequisites

- Your Supabase project (you already have this!)
- Resend API key
- Supabase CLI installed

## Step 1: Install Supabase CLI

Open PowerShell and run:

```powershell
# Install Supabase CLI globally
npm install -g supabase

# Verify installation
supabase --version
```

## Step 2: Login to Supabase

```powershell
# Login (this will open your browser)
supabase login

# You'll be redirected to authorize the CLI
```

## Step 3: Link Your Project

```powershell
# Navigate to your project folder
cd "C:\FMA Studios\ARCarRentals"

# Link to your Supabase project
supabase link --project-ref dnexspoyhhqflatuyxje

# Enter your database password when prompted
```

## Step 4: Create the Edge Function

```powershell
# Create a new edge function
supabase functions new send-booking-email
```

This creates: `supabase/functions/send-booking-email/index.ts`

## Step 5: Update the Function Code

The function file has been created for you. Just review it at:
`supabase/functions/send-booking-email/index.ts`

## Step 6: Set Resend API Key Secret

```powershell
# Set the Resend API key as a secret (replace with your actual key)
supabase secrets set RESEND_API_KEY=re_your_actual_resend_api_key_here

# Verify the secret was set
supabase secrets list
```

## Step 7: Deploy the Function

```powershell
# Deploy the function to Supabase
supabase functions deploy send-booking-email

# You should see: "Deployed Function send-booking-email"
```

## Step 8: Get Your Function URL

Your function URL will be:
```
https://dnexspoyhhqflatuyxje.supabase.co/functions/v1/send-booking-email
```

This has been automatically added to your `.env` file!

## Step 9: Test the Function

After I update your code, restart your dev server:

```powershell
npm run dev
```

Then create a test booking with your email address.

## Troubleshooting

### Function deployment fails

```powershell
# Check function logs
supabase functions logs send-booking-email

# Test function locally first
supabase functions serve send-booking-email
```

### Email not sending

1. **Check secrets:**
   ```powershell
   supabase secrets list
   ```
   Make sure `RESEND_API_KEY` is listed

2. **Check logs:**
   ```powershell
   supabase functions logs send-booking-email --tail
   ```
   This shows real-time logs

3. **Verify Resend API key:**
   - Login to Resend dashboard
   - Check if API key is valid
   - Make sure it has "Sending Access" permission

### Function returns 401 Unauthorized

This means your Resend API key is incorrect. Update it:
```powershell
supabase secrets set RESEND_API_KEY=re_correct_key_here
supabase functions deploy send-booking-email
```

## Testing Locally (Optional)

You can test the function locally before deploying:

```powershell
# Start local Supabase
supabase start

# Serve the function locally
supabase functions serve send-booking-email

# Test with curl (in another terminal)
curl -X POST http://localhost:54321/functions/v1/send-booking-email `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"bookingReference\":\"TEST-123\",\"magicLink\":\"http://test.com\"}'
```

## Cost

**Supabase Edge Functions Free Tier:**
- 500,000 invocations per month
- 200 concurrent invocations
- 2GB outbound data transfer

**For your car rental business:**
- 10 bookings/day = 300 emails/month = **FREE**
- 100 bookings/day = 3,000 emails/month = **FREE**
- 1,000 bookings/day = 30,000 emails/month = **FREE**

You'd need 16,000+ bookings/day to exceed the free tier!

## What Happens After Setup

1. ✅ Customer makes booking
2. ✅ Receipt uploaded to Supabase Storage
3. ✅ Booking saved to database
4. ✅ **Edge function called automatically**
5. ✅ **Email sent via Resend**
6. ✅ Customer receives beautiful booking confirmation email
7. ✅ Magic link works for tracking

## Next Steps

After following all steps above:

1. Update `.env.local` with your Supabase function URL (already done!)
2. I'll update the code to use the edge function
3. Test with a real booking
4. Check your email inbox

## Support

- **Supabase Edge Functions Docs:** https://supabase.com/docs/guides/functions
- **Supabase Status:** https://status.supabase.com
- **Resend Docs:** https://resend.com/docs
