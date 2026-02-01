# 🔧 Quick Fix for CORS Error

## Problem
The edge function is deployed but missing the `Access-Control-Allow-Methods` CORS header, causing preflight requests to fail.

## Solution - Redeploy with Fixed CORS

I've already fixed the CORS configuration in:
- ✅ `supabase/functions/_shared/cors.ts` - Added missing header
- ✅ `supabase/functions/send-booking-email/index.ts` - Fixed OPTIONS response

Now you just need to redeploy:

### Step 1: Login to Supabase
```powershell
npx supabase login
```
This will open your browser to authenticate.

### Step 2: Redeploy the Function
```powershell
npx supabase functions deploy send-booking-email
```

### Step 3: Test Again
Restart your dev server and try creating a booking again:
```powershell
npm run dev
```

## What Was Fixed

**Before (causing CORS error):**
```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  // Missing: Access-Control-Allow-Methods
}
```

**After (works correctly):**
```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',  // ✅ Added this
}
```

**OPTIONS Handler (also fixed):**
```typescript
if (req.method === 'OPTIONS') {
  return new Response(null, {   // Changed from 'ok' to null
    status: 204,                // Changed from default 200 to 204
    headers: corsHeaders 
  })
}
```

## Why This Happened
The browser makes a "preflight" OPTIONS request before POST to check if CORS is allowed. Without `Access-Control-Allow-Methods`, the browser blocks the actual POST request.

## Alternative: Manual Deployment
If npx doesn't work, try:
```powershell
# Add npm global bin to PATH temporarily
$env:PATH += ";$env:APPDATA\npm"

# Now deploy
supabase functions deploy send-booking-email
```

## Expected Result
After redeployment, you should see:
- ✅ No CORS errors in console
- ✅ "📧 Sending via Supabase Edge Function..." log
- ✅ "✅ Email sent successfully" log
- ✅ Email arrives in inbox

## Still Having Issues?
Check function logs:
```powershell
npx supabase functions logs send-booking-email --tail
```
