# Email Integration Setup Guide

This guide will help you set up email notifications using Resend for the AR Car Rentals booking system.

## ⚠️ Important: Backend Required

**Note:** Email sending requires a backend API due to browser CORS restrictions. The Resend API cannot be called directly from the browser for security reasons.

**Current Status:** Booking works perfectly, but emails require backend implementation.

**Workaround:** Users receive the magic link on the confirmation page and can bookmark/copy it.

## Prerequisites

- A Resend account (free tier available)
- A backend service (Node.js, Netlify Functions, Vercel Functions, etc.)
- Access to your `.env.local` file

## Step 1: Sign Up for Resend

1. Go to [https://resend.com/signup](https://resend.com/signup)
2. Create a free account (no credit card required)
3. Verify your email address

## Step 2: Get Your API Key

1. Log in to your Resend dashboard
2. Navigate to **API Keys** section
3. Click **Create API Key**
4. Give it a name (e.g., "AR Car Rentals Development")
5. Select permissions: **Full Access** or **Sending Access**
6. Copy the API key (it starts with `re_`)

## Step 3: Configure Environment Variables

1. Copy `.env.local.template` to `.env.local`:
   ```bash
   cp .env.local.template .env.local
   ```

2. Open `.env.local` and add your Resend API key:
   ```env
   VITE_RESEND_API_KEY=re_your_actual_key_here
   ```

3. Configure email sender:
   
   **Free Tier (Default):**
   ```env
   VITE_FROM_EMAIL=onboarding@resend.dev
   VITE_FROM_NAME=AR Car Rentals
   ```

   **Custom Domain (Paid/Verified):**
   ```env
   VITE_FROM_EMAIL=noreply@yourdomain.com
   VITE_FROM_NAME=AR Car Rentals
   ```

## Step 4: Create Backend Email Endpoint

Due to CORS restrictions, you need a backend API to send emails. Here are options:

### Option A: Netlify Functions (Recommended for Static Sites)

Create `netlify/functions/send-email.js`:
```javascript
const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { email, bookingReference, magicLink, bookingDetails } = JSON.parse(event.body);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'AR Car Rentals <onboarding@resend.dev>',
      to: [email],
      subject: `Booking Confirmed - ${bookingReference}`,
      html: `Your booking ${bookingReference} is confirmed! <a href="${magicLink}">Track here</a>`,
    }),
  });

  const data = await response.json();
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};
```

Then update `emailService.ts` to call your function:
```typescript
const response = await fetch('/.netlify/functions/send-email', {
  method: 'POST',
  body: JSON.stringify({ email, bookingReference, magicLink, bookingDetails })
});
```

### Option B: Vercel Serverless Function

Create `api/send-email.js`:
```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, bookingReference, magicLink } = req.body;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
      to: [email],
      subject: `Booking ${bookingReference} Confirmed`,
      html: `<a href="${magicLink}">Track booking</a>`,
    }),
  });

  const data = await response.json();
  res.status(200).json(data);
}
```

### Option C: Express Backend

```javascript
app.post('/api/send-email', async (req, res) => {
  const { email, bookingReference, magicLink } = req.body;
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
      to: [email],
      subject: `Booking ${bookingReference}`,
      html: `Magic link: ${magicLink}`,
    }),
  });
  
  res.json(await response.json());
});
```

## Step 5: Verify Domain (Optional - for Custom Email)

If you want to send from your own domain (not `onboarding@resend.dev`):

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `arcarrentals.com`)
4. Add the DNS records to your domain provider
5. Wait for verification (usually 1-5 minutes)
6. Once verified, update `VITE_FROM_EMAIL` in `.env.local`

## Step 6: Test Email Sending

1. Deploy your backend function
2. Update `emailService.ts` to call your backend
3. Restart your development server:
   ```bash
   npm run dev
   ```

4. Create a test booking:
   - Go to Browse Vehicles page
   - Select a vehicle
   - Fill in booking details with **your own email address**
   - Complete the checkout process
   - Upload a receipt

5. Check your email inbox for the booking confirmation

## Email Features

The system sends the following emails:

### 1. Magic Link Email (Booking Confirmation)
- **Trigger:** After successful booking and payment
- **Contains:**
  - Booking reference number
  - Vehicle and rental dates
  - Secure magic link to track booking
  - Security notice about link expiration

### 2. Receipt Email (Future Enhancement)
- **Trigger:** When admin approves payment
- **Contains:**
  - Payment receipt
  - Booking details
  - Download link

## Troubleshooting

### Email Not Sending

1. **Check API Key:**
   ```bash
   # Make sure your .env.local has the correct key
   cat .env.local | grep VITE_RESEND_API_KEY
   ```

2. **Check Console:**
   - Open browser DevTools → Console
   - Look for email-related logs:
     - `📧 Sending magic link email to...`
     - `✅ Email sent successfully`
     - `❌ Failed to send email`

3. **Common Issues:**
   - API key not set or incorrect format
   - Using custom domain without verification
   - Email address format invalid
   - Rate limit exceeded (free tier: 100 emails/day)

### Email Goes to Spam

1. Using `onboarding@resend.dev` may go to spam
2. Verify your own domain for better deliverability
3. Add SPF, DKIM records as shown in Resend dashboard
4. Ask recipients to whitelist sender

### Testing Without Actual Emails

The system works without email configuration:
- Booking still completes successfully
- Magic link is shown on confirmation page
- Console logs show email details
- Users can copy/bookmark the magic link

## Rate Limits

**Resend Free Tier:**
- 100 emails per day
- 1 verified domain
- API access

**Paid Plans:**
- Higher send volumes
- Multiple domains
- Priority support

## Security Best Practices

1. **Never commit `.env.local`** - it's in `.gitignore`
2. **Rotate API keys** if exposed
3. **Use separate keys** for development/production
4. **Monitor usage** in Resend dashboard
5. **Set up alerts** for unusual activity

## Email Template Customization

To customize email templates, edit:
```
src/services/emailService.ts
```

Functions to modify:
- `getMagicLinkEmailHTML()` - HTML version
- `getMagicLinkEmailText()` - Plain text version

## Production Deployment

Before deploying to production:

1. ✅ Verify your domain in Resend
2. ✅ Update `VITE_FROM_EMAIL` to your domain
3. ✅ Set production API key (separate from dev)
4. ✅ Test email delivery
5. ✅ Monitor send rates
6. ✅ Set up error alerting

## Support

- **Resend Docs:** https://resend.com/docs
- **Resend Status:** https://status.resend.com
- **Support:** support@resend.com

## Cost Estimate

- **Development:** Free (100 emails/day)
- **Production:** 
  - $20/month for 50,000 emails
  - $0.0002 per email after

For a car rental business:
- ~10 bookings/day = 300 emails/month = **Free**
- ~100 bookings/day = 3,000 emails/month = **Free**
- ~1,000 bookings/day = 30,000 emails/month = **$20/month**
