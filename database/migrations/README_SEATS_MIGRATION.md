# Apply Database Migration: Change Seats to Text

This migration changes the `seats` column from `integer` to `text` to support seat ranges like "4-5", "7-8", etc.

## Apply the Migration

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `change_seats_to_text.sql`
4. Paste and run the migration

### Option 2: Using psql Command Line
```bash
psql -h <your-db-host> -U postgres -d postgres -f database/migrations/change_seats_to_text.sql
```

## What This Changes

**Before:** `seats integer NOT NULL DEFAULT 5`
- Could only store single numbers: 5, 7, 8

**After:** `seats text NOT NULL DEFAULT '5'`
- Can store single numbers: "5", "7", "8"
- Can store ranges: "4-5", "7-8", "13-15"

## Display Behavior

- Single number: "5" → displays as "5 Seats"
- Range: "4-5" → displays as "4-5 Seats"
- Range: "7-8" → displays as "7-8 Seats"

## Files Updated
- ✅ `src/types/index.ts` - Car interface updated
- ✅ `src/services/vehicleService.ts` - Vehicle interface updated
- ✅ `src/components/ui/AddVehicleModal.tsx` - Saves seats as string
- ✅ `src/components/ui/EditVehicleModal.tsx` - Saves seats as string
- ✅ `src/components/ui/CarCard.tsx` - Already displays correctly
- ✅ `src/pages/BrowseVehicles/BrowseVehiclesPage.tsx` - Filter logic handles ranges

## Testing After Migration
1. Edit an existing vehicle and change seats to "4-5"
2. Verify it saves without errors
3. Check that the vehicle card displays "4-5 Seats"
4. Add a new vehicle with range like "7-8"
5. Verify filters still work correctly
