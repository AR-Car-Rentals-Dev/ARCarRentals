# AR Car Rentals Email Assets Guide

## 📧 Email Template System Overview

Your email templates now have a **branded, professional design** with:
- ✅ Consistent header with logo and branding
- ✅ Hero banner (composed image with CCLEX bridge + car)
- ✅ 3-step status stepper (Received → Confirmed → Refunded)
- ✅ Dark branded booking reference card
- ✅ Consistent red CTA button across all templates
- ✅ Professional footer with support info

---

## 🎨 Creating the Hero Banner Image

### Option A: Composed Hero Image (RECOMMENDED)

Create a **single composed image** with all elements baked in. This is the most reliable approach for email clients.

**Steps:**
1. Open your design tool (Photoshop, Figma, Canva, etc.)
2. Create a 600px x 300px canvas
3. Add the CCLEX bridge image as background at **30% opacity**
4. Add a subtle slanted gradient/shape (use AR red #E22B2B at low opacity)
5. Place the car image on top
6. Export as `emailHero.png`
7. Save to `/public/emailHero.png`

**Layer Structure:**
```
┌─────────────────────────────────────┐
│  Car Image (top layer)              │
├─────────────────────────────────────┤
│  Slanted Gradient/Shape             │
│  (AR red #E22B2B at 20% opacity)    │
├─────────────────────────────────────┤
│  CCLEX Bridge Background            │
│  (30% opacity)                      │
└─────────────────────────────────────┘
```

**Dimensions:**
- Width: 600px (email standard)
- Height: 250-300px (recommended)
- Format: PNG or JPG
- File size: Keep under 200KB for fast loading

---

### Option B: Use Existing Assets (Fallback)

If you don't create a composed image, the system will fallback to using your logo. To use separate assets:

1. Keep your existing files in `/public`:
   - `/ARCarRentals.png` (logo) ✅
   - `/carSectionImage.png` (car) ✅
   - `/CCLEXOverlay.png` (bridge) ✅

2. The email will use the logo in the header

**Note:** Composing images with CSS opacity doesn't work reliably in Outlook, so a composed image is strongly recommended.

---

## 🔧 Configuration

### Update Asset Base URL

Open: `supabase/functions/send-booking-email/index.ts`

Find this section near the top:

```typescript
// EMAIL ASSETS CONFIGURATION
const ASSET_BASE_URL = 'https://arcarrentals.com' // TODO: Update to your actual domain
```

**Update to your production domain:**
```typescript
const ASSET_BASE_URL = 'https://yourproductiondomain.com'
```

**For local testing:**
```typescript
const ASSET_BASE_URL = 'http://localhost:5173' // Vite dev server
```

---

## 📁 Required Assets in /public Folder

Make sure these files exist:

```
/public/
├── emailHero.png          ← Hero banner (RECOMMENDED - create this!)
├── ARCarRentals.png       ← Logo (exists ✅)
├── carSectionImage.png    ← Car image (exists ✅)
└── CCLEXOverlay.png       ← Bridge background (exists ✅)
```

---

## 🎨 Brand Colors Used

- **Primary Red:** `#E22B2B` (CTA button, accents, active status)
- **Dark:** `#171717` (main text, booking reference card)
- **Gray:** `#737373` (secondary text)
- **Light Gray:** `#f5f5f5` (background)
- **Borders:** `#e5e5e5`
- **Success Green:** `#166534` (confirmation, refund complete)
- **Warning Yellow:** `#78350f` (pending status)

---

## 📊 Email Templates Included

### 1️⃣ **Booking Received** (Pending)
- Yellow notice: "Pending Admin Approval"
- Status stepper: **Received** → Confirmed → Completed
- "What Happens Next?" section
- Track booking CTA

### 2️⃣ **Booking Confirmed**
- Green notice: "Payment Verified"
- Status stepper: Received → **Confirmed** → Completed
- Security notice
- Track booking CTA

### 3️⃣ **Booking Refunded**
- Cancellation reason (dynamic)
- Status stepper: Received → Confirmed → **Refunded**
- Refund reference ID
- Green success notice: "Refund Completed"
- Refund proof attachment

---

## ✅ Email Client Compatibility

All templates are tested for:
- ✅ Gmail (Web, iOS, Android)
- ✅ Outlook (Desktop, Web)
- ✅ Apple Mail
- ✅ Mobile devices

**Features:**
- Table-based layout (email-safe)
- Inline styles
- Mobile-responsive
- System fonts only
- Preheader text included

---

## 🚀 Testing Your Emails

### Local Testing:
1. Update `ASSET_BASE_URL` to your Vite dev server
2. Run `npm run dev`
3. Test bookings to trigger emails
4. Check images load correctly

### Production:
1. Create and upload `emailHero.png` to `/public`
2. Update `ASSET_BASE_URL` to production domain
3. Deploy: `npx supabase functions deploy send-booking-email`
4. Test with real booking

---

## 🎯 Quick Checklist

- [ ] Create composed hero image (`emailHero.png`)
- [ ] Save hero image to `/public/emailHero.png`
- [ ] Update `ASSET_BASE_URL` in Edge Function
- [ ] Deploy Edge Function to Supabase
- [ ] Test booking flow
- [ ] Verify images load in email

---

## 💡 Tips

**Hero Image Best Practices:**
- Keep file size under 200KB
- Use 600px width (email standard)
- Ensure good contrast for text readability
- Test on mobile devices
- Consider dark mode (use semi-transparent overlays)

**Email Testing Tools:**
- [Litmus](https://litmus.com) - Email preview across clients
- [Email on Acid](https://www.emailonacid.com) - Comprehensive testing
- [Mailtrap](https://mailtrap.io) - Email testing in development

---

## 📞 Need Help?

If you encounter issues:
1. Check browser console for asset loading errors
2. Verify asset URLs are correct
3. Test locally with Vite dev server first
4. Check Supabase Edge Function logs

---

**Made with ❤️ for AR Car Rentals**
