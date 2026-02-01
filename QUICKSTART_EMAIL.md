# 🚀 Quick Start: Email Setup with Supabase

## Prerequisites
- ✅ Supabase project (you have this!)
- ✅ Resend account (sign up at https://resend.com/signup)
- ✅ Resend API key

## Option 1: Automated Setup (Easiest!)

Run the setup script:
```powershell
cd "C:\FMA Studios\ARCarRentals"
.\setup-email.ps1
```

This will automatically:
1. Install Supabase CLI
2. Login to Supabase
3. Link your project
4. Set your Resend API key
5. Deploy the email function

## Option 2: Manual Setup

```powershell
# 1. Install Supabase CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Link project
cd "C:\FMA Studios\ARCarRentals"
supabase link --project-ref dnexspoyhhqflatuyxje

# 4. Set Resend API key
supabase secrets set RESEND_API_KEY=re_your_actual_key_here

# 5. Deploy function
supabase functions deploy send-booking-email
```

## Testing

```powershell
# 1. Restart dev server
npm run dev

# 2. Create a booking with your email address

# 3. Check your inbox!
```

## Troubleshooting

### View function logs
```powershell
supabase functions logs send-booking-email --tail
```

### Update Resend API key
```powershell
supabase secrets set RESEND_API_KEY=re_new_key_here
supabase functions deploy send-booking-email
```

### Test function locally
```powershell
supabase functions serve send-booking-email
```

## Your Function URL
```
https://dnexspoyhhqflatuyxje.supabase.co/functions/v1/send-booking-email
```

## Files Created
- ✅ `supabase/functions/send-booking-email/index.ts` - Email function
- ✅ `supabase/functions/_shared/cors.ts` - CORS config
- ✅ `SUPABASE_EMAIL_SETUP.md` - Detailed guide
- ✅ `setup-email.ps1` - Automated setup script

## What Happens Now

1. Customer makes booking → ✅
2. Receipt uploaded → ✅
3. Booking saved to database → ✅
4. **Email sent automatically** → ✅ (after setup!)
5. Customer receives beautiful email → ✅
6. Magic link in email works → ✅

## Need Help?

See detailed guide: `SUPABASE_EMAIL_SETUP.md`
