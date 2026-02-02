# 📧 Two-Stage Email System

## Overview
The booking system now sends **two different emails** based on booking status:

### 1. 🟡 Pending Email (Awaiting Confirmation)
**When:** Customer submits payment receipt  
**Subject:** `Booking Received - [REF] (Awaiting Confirmation) | AR Car Rentals`  
**Color Theme:** Orange (#F59E0B)  
**Content:**
- "Your booking request is being processed"
- "Pending Admin Approval" notice
- Explains admin will review payment receipt
- Usually confirmed within 24 hours
- Includes booking reference and magic link

### 2. 🟢 Confirmed Email (Booking Approved)
**When:** Admin changes status from "pending" to "confirmed"  
**Subject:** `Booking Confirmed - [REF] | AR Car Rentals`  
**Color Theme:** Red (#E22B2B - brand color)  
**Content:**
- "Your booking has been successfully confirmed"
- Booking details confirmed
- Ready for vehicle pickup
- Includes booking reference and magic link

---

## How It Works

### Customer Journey
1. **Customer books vehicle** → Uploads payment receipt
2. **System sends "Pending" email** → Yellow/orange themed
3. **Admin reviews booking** → Opens AdminBookingsPage
4. **Admin changes status to "confirmed"** → In EditBookingModal
5. **System sends "Confirmed" email** → Red/green themed

### Technical Flow

#### Frontend (Customer Side)
```typescript
// src/services/bookingSecurityService.ts
await sendMagicLinkEmail(
  email,
  bookingReference,
  magicLink,
  bookingDetails,
  'pending'  // ← Email type
)
```

#### Frontend (Admin Side)
```typescript
// src/components/ui/EditBookingModal.tsx
// When status changes from 'pending' to 'confirmed'
await sendMagicLinkEmail(
  email,
  bookingReference,
  magicLink,
  bookingDetails,
  'confirmed'  // ← Email type
)
```

#### Edge Function (Backend)
```typescript
// supabase/functions/send-booking-email/index.ts
const emailType = 'pending' | 'confirmed'  // Defaults to 'pending'

// Chooses template based on type
const emailHTML = emailType === 'pending' 
  ? getPendingEmailHTML(...)  // Orange theme
  : getConfirmedEmailHTML(...)  // Red theme
```

---

## Email Templates

### Pending Email Features
- ⏳ Orange header with "Booking Received!"
- ⚠️ Warning box: "Pending Admin Approval"
- 📋 "What Happens Next?" section with 4 steps
- 🔗 Magic link to track status
- ℹ️ Customer support contact info

### Confirmed Email Features
- 🚗 Red header with "Booking Confirmed!"
- ✅ Green success indicators
- 📅 Confirmed booking details
- 🔗 Magic link to view booking
- 🔒 Security notice about link expiration

---

## Testing

### Test Pending Email
1. Go to checkout page
2. Upload payment receipt
3. Submit booking
4. Check email inbox for "Awaiting Confirmation" email

### Test Confirmed Email
1. Login as admin
2. Go to Admin → Bookings
3. Find a "pending" booking
4. Click Edit → Change status to "confirmed"
5. Save
6. Customer receives "Booking Confirmed" email

---

## Files Modified

✅ **Edge Function:**
- `supabase/functions/send-booking-email/index.ts` - Added emailType parameter, two templates

✅ **Frontend Services:**
- `src/services/emailService.ts` - Added emailType parameter
- `src/services/bookingSecurityService.ts` - Sends 'pending' type, added getMagicLinkFromBooking()

✅ **Admin Components:**
- `src/components/ui/EditBookingModal.tsx` - Sends 'confirmed' email when status changes

---

## Environment Variables

Make sure these are set in Supabase Dashboard:
- `RESEND_API_KEY` - Your Resend API key (set in Edge Functions → Secrets)

In `.env.local`:
```env
VITE_SUPABASE_URL=https://dnexspoyhhqflatuyxje.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## Troubleshooting

### Email not sending
```powershell
# Check function logs
npx supabase functions logs send-booking-email --tail
```

### Wrong email type sent
Check console logs:
- `📋 Email Type: pending` or `📋 Email Type: confirmed`

### Admin email not sending
Make sure:
1. Booking has `customer_email` field populated
2. Status changed from 'pending' to 'confirmed'
3. Check browser console for errors

---

## Future Enhancements

Possible additions:
- 🚫 Rejected email (when admin cancels)
- 📱 SMS notifications
- 🔔 In-app notifications
- 📊 Email delivery tracking
- ✉️ HTML email preview in admin panel
