# Refund Workflow Implementation

## Overview
This document describes the complete refund workflow system implemented for AR Car Rentals. The system intelligently handles booking declines based on payment status, ensuring proper refund tracking and customer communication.

## Key Features

### 1. Smart Decline System
The decline workflow automatically differentiates between:
- **Fake/Invalid Payment**: Simple cancellation, no refund needed
- **Valid Payment + Car Unavailable**: Requires refund proof before completion

### 2. Booking Status Flow

```
pending → confirmed → completed
pending → cancelled (fake payment, no refund)
pending → refunded (valid payment, refund completed)
```

#### Status Definitions:
- **pending**: Customer uploaded receipt, awaiting admin review
- **confirmed**: Admin accepted booking, car is reserved
- **cancelled**: Booking declined due to fake/invalid payment (no refund needed)
- **refunded**: Booking declined but payment was valid, refund has been processed
- **completed**: Booking successfully fulfilled

### 3. Refund Status Field
Tracks the refund process independently:
- **none**: No refund needed or initiated
- **pending**: Refund initiated but not yet completed (currently unused, may be used for multi-step refund processes)
- **completed**: Refund has been sent to customer

## Database Schema

### New Columns Added to `bookings` Table:

```sql
cancellation_reason      TEXT          -- Admin's reason for declining
refund_status           TEXT          -- 'none', 'pending', 'completed'
refund_reference_id     TEXT          -- GCash/Bank reference number
refund_proof_url        TEXT          -- URL to uploaded refund receipt
```

**Migration File**: `database/migrations/add_refund_workflow.sql`

## Implementation Components

### 1. Smart Decline Modal (`SmartDeclineModal.tsx`)

**Location**: `src/components/ui/SmartDeclineModal.tsx`

**Features**:
- **Step 1: Reason Selection**
  - Fake/Invalid Payment → Direct cancellation
  - Vehicle Unavailable → Proceeds to refund step
  - Other Reason → Custom input required

- **Step 2: Refund Details** (only for valid payments)
  - Refund Reference Number input (e.g., GCash Ref #)
  - Refund Receipt/Proof upload (image, max 5MB)
  - Validates all fields before submission

**Payment Detection**:
```typescript
const hasValidPayment = booking?.payments && 
  booking.payments.length > 0 && 
  (booking.payments[0].payment_status === 'paid' || 
   booking.payments[0].payment_status === 'pending');
```

### 2. Updated Booking Service

**Location**: `src/services/adminBookingService.ts`

**New Functions**:

```typescript
// Cancel booking without refund (fake payment)
declineWithCancellation(id, reason)

// Set status to refund_pending (for multi-step workflow)
declineWithRefundPending(id, reason)

// Complete refund with proof (single-step)
declineWithRefund(id, reason, refundReferenceId, refundProofUrl)

// Complete an existing refund_pending booking
completeRefund(id, refundReferenceId, refundProofUrl)
```

### 3. Email Service Updates

**Location**: `src/services/emailService.ts`

**New Email Functions**:

```typescript
// Send when booking declined with cancellation
sendBookingDeclinedEmail(email, bookingRef, customerName, reason, ...)

// Send when refund initiated (optional use)
sendRefundPendingEmail(email, bookingRef, customerName, reason, ...)

// Send when refund completed with proof
sendRefundCompletedEmail(email, bookingRef, customerName, refundDetails, ...)
```

### 4. Admin Bookings Page Updates

**Location**: `src/pages/AdminBookingsPage.tsx`

**Changes**:
- Added `refund_pending` and `refunded` status badges
- Updated stats to track refund statuses
- Added filter options for refund statuses
- Integrated `SmartDeclineModal` component

**New Status Badges**:
```typescript
refund_pending: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Refund Pending' }
refunded: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Refunded' }
```

## Usage Instructions

### For Admins

#### Scenario 1: Fake/Invalid Payment Receipt

1. Open booking in Admin Bookings page
2. Click "Decline" or use Smart Decline Modal
3. Select **"Fake/Invalid Payment"** reason
4. Click "Decline Booking"
5. **Result**: 
   - Status → `cancelled`
   - Refund Status → `none`
   - Email sent to customer with cancellation notice

#### Scenario 2: Valid Payment but Car Unavailable

1. Open booking in Admin Bookings page
2. Click "Decline" or use Smart Decline Modal
3. Select **"Vehicle Unavailable"** reason
4. Provide additional details (optional)
5. Click "Continue to Refund"
6. **Refund Details Form appears**:
   - Enter refund reference number (e.g., "GCash Ref #123456789")
   - Upload screenshot/proof of refund transaction
7. Click "Complete Refund & Decline"
8. **Result**:
   - Status → `refunded`
   - Refund Status → `completed`
   - Refund reference and proof URL stored
   - Email sent to customer with refund confirmation

### File Upload Details

**Storage Location**: Supabase Storage bucket `receipts/refund-proofs/`

**Naming Convention**: `refund_{booking_id}_{timestamp}.{ext}`

**Supported Formats**: PNG, JPG, JPEG

**Max File Size**: 5MB

**Public Access**: Yes (for customer verification)

## Security Considerations

1. **Refund Proof Requirement**: 
   - System prevents decline completion without refund proof for paid bookings
   - Admin cannot bypass this requirement through UI

2. **Audit Trail**:
   - All refund transactions tracked with reference IDs
   - Proof images stored permanently
   - Timestamps recorded for all status changes

3. **Email Notifications**:
   - Customers receive immediate notification
   - Includes refund reference number
   - May include link to refund proof (if configured)

## Testing Checklist

### Before Deployment:

- [ ] Run database migration: `add_refund_workflow.sql`
- [ ] Verify Supabase storage bucket exists: `receipts`
- [ ] Test fake payment decline flow
- [ ] Test valid payment + refund flow
- [ ] Verify email delivery for both scenarios
- [ ] Check refund proof upload and storage
- [ ] Confirm status badges display correctly
- [ ] Test filter options for refund statuses

### Post-Deployment:

- [ ] Monitor first real refund transaction
- [ ] Verify customer receives refund confirmation email
- [ ] Check refund proof is accessible
- [ ] Review admin dashboard stats accuracy

## Future Enhancements

### Potential Improvements:

1. **Multi-Step Refund Workflow**:
   - Use `refund_pending` status for initiated but incomplete refunds
   - Allow admins to process refund in separate steps
   - Add "Complete Refund" button for `refund_pending` bookings

2. **Refund Tracking Dashboard**:
   - Dedicated page for refund management
   - Filter by refund status
   - Batch refund operations

3. **Automated Refund Reminders**:
   - Notify admin if booking stuck in `refund_pending` > 24 hours
   - Send customer updates on refund progress

4. **Payment Gateway Integration**:
   - Automatic refund processing via payment API
   - Real-time refund status updates
   - Eliminates manual refund proof upload

5. **Customer Refund Portal**:
   - Allow customers to view refund status
   - Download refund receipt
   - Track refund timeline

## Troubleshooting

### Common Issues:

**Issue**: Modal doesn't show refund step for paid booking
- **Check**: Verify payment status is 'paid' or 'pending'
- **Check**: Ensure `payments` array exists in booking data

**Issue**: File upload fails
- **Check**: File size < 5MB
- **Check**: File type is image (PNG/JPG)
- **Check**: Supabase storage bucket permissions

**Issue**: Email not sent
- **Check**: `VITE_SUPABASE_ANON_KEY` environment variable
- **Check**: Edge function `send-booking-email` is deployed
- **Check**: Customer email exists in booking data

## API Reference

### Booking Service Methods

```typescript
// Decline with cancellation (no refund)
await bookingService.declineWithCancellation(bookingId, reason);

// Decline with immediate refund (one-step)
await bookingService.declineWithRefund(
  bookingId, 
  reason, 
  refundReferenceId, 
  refundProofUrl
);

// Set refund pending (two-step workflow)
await bookingService.declineWithRefundPending(bookingId, reason);

// Complete pending refund
await bookingService.completeRefund(
  bookingId, 
  refundReferenceId, 
  refundProofUrl
);
```

### Email Service Methods

```typescript
// Send cancellation email
await sendBookingDeclinedEmail(
  email,
  bookingReference,
  customerName,
  declineReason,
  customMessage?,
  bookingDetails?
);

// Send refund completed email
await sendRefundCompletedEmail(
  email,
  bookingReference,
  customerName,
  {
    vehicleName,
    totalPrice,
    refundReferenceId,
    refundProofUrl?
  },
  cancellationReason?
);
```

## Support

For questions or issues with the refund workflow:
1. Check this documentation first
2. Review the code comments in implementation files
3. Test in development environment before production use
4. Contact development team for assistance

---

**Last Updated**: February 4, 2026
**Version**: 1.0.0
**Status**: Production Ready
