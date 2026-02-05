# Refund Workflow - Quick Reference

## What Changed?

### ✅ New Booking Statuses
- `refund_pending` - Payment valid, refund initiated
- `refunded` - Payment valid, refund completed with proof

### ✅ New Database Columns (bookings table)
```sql
cancellation_reason     TEXT    -- Why booking was declined
refund_status          TEXT    -- none/pending/completed
refund_reference_id    TEXT    -- GCash/Bank ref number
refund_proof_url       TEXT    -- Uploaded receipt image
```

### ✅ Smart Decline Modal
**Location**: `src/components/ui/SmartDeclineModal.tsx`

**How it works**:
1. Admin clicks "Decline" on a booking
2. Modal checks if payment exists
3. **No payment / Fake payment** → Simple cancellation
4. **Valid payment** → Requires refund proof:
   - Refund reference number
   - Upload refund receipt screenshot
   - Only then can complete decline

### ✅ New Service Functions

**Booking Service** (`src/services/adminBookingService.ts`):
```typescript
declineWithCancellation(id, reason)  // Fake payment
declineWithRefund(id, reason, ref, proof)  // Valid payment + refund
completeRefund(id, ref, proof)  // Complete pending refund
```

**Email Service** (`src/services/emailService.ts`):
```typescript
sendRefundCompletedEmail(email, ref, name, refundDetails)
```

## How to Use

### Scenario 1: Fake Payment
1. Select "Fake/Invalid Payment" reason
2. Click "Decline Booking"
3. ✅ Status → `cancelled`, customer notified

### Scenario 2: Valid Payment, Need Refund
1. Select "Vehicle Unavailable" or "Other"
2. Click "Continue to Refund"
3. Enter refund reference (e.g., "GCash #123456")
4. Upload refund proof screenshot
5. Click "Complete Refund & Decline"
6. ✅ Status → `refunded`, customer gets email with proof

## Files Modified

### Core Implementation
- ✅ `database/migrations/add_refund_workflow.sql` - DB schema
- ✅ `src/types/index.ts` - TypeScript types
- ✅ `src/services/adminBookingService.ts` - Service functions
- ✅ `src/services/emailService.ts` - Email templates
- ✅ `src/components/ui/SmartDeclineModal.tsx` - New modal
- ✅ `src/components/ui/index.ts` - Export modal
- ✅ `src/pages/AdminBookingsPage.tsx` - UI integration

### Documentation
- ✅ `REFUND_WORKFLOW.md` - Complete documentation
- ✅ `REFUND_WORKFLOW_QUICK_REF.md` - This file

## Before Going Live

1. **Apply Database Migration**:
   ```sql
   -- Run this in Supabase SQL Editor:
   -- File: database/migrations/add_refund_workflow.sql
   ```

2. **Test Both Flows**:
   - [ ] Decline with fake payment
   - [ ] Decline with refund proof

3. **Verify Email Delivery**:
   - [ ] Cancellation email works
   - [ ] Refund email works

4. **Check File Upload**:
   - [ ] Can upload refund proof
   - [ ] Image appears in storage

## Admin Dashboard Changes

### New Status Badges
- 🟠 **Refund Pending** - Orange badge
- 🔵 **Refunded** - Blue badge

### Updated Filters
- Added "Refund Pending" option
- Added "Refunded" option

### Updated Stats
- Tracks refund_pending count
- Tracks refunded count

## Customer Experience

### If Payment is Fake:
📧 Email: "Booking Cancelled: Payment Verification Failed"
- No refund mentioned
- Clear explanation of issue

### If Payment is Valid (Refund Given):
📧 Email: "Booking Cancelled: Refund Processed"
- Includes refund reference number
- May include link to refund proof
- Clear timeline and amount

## Support

**Questions?** Check the full documentation:
📄 `REFUND_WORKFLOW.md`

**Issues?** Review these files:
- `SmartDeclineModal.tsx` - Modal logic
- `adminBookingService.ts` - Backend operations
- `AdminBookingsPage.tsx` - UI integration

---

**Version**: 1.0.0  
**Date**: February 4, 2026  
**Status**: ✅ Ready for Testing
