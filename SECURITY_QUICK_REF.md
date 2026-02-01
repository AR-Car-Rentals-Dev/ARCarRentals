# Security System Quick Reference

## Import Patterns

### Session Management
```typescript
import { 
  initSession, 
  saveSession, 
  getSession,
  updateVehicle,
  updateRenterInfo,
  canAccessStep 
} from '@utils/sessionManager';
```

### Security Functions
```typescript
import { 
  validateFileType,
  generateBookingReference,
  isTokenExpired 
} from '@utils/security';
```

### Booking Service
```typescript
import { 
  createSecureBooking,
  verifyMagicToken,
  getBookingById 
} from '@services/bookingSecurityService';
```

## Common Patterns

### Initialize Session (Browse Page)
```typescript
useEffect(() => {
  if (!getSession().sessionId) {
    initSession();
  }
}, []);
```

### Save Vehicle Selection
```typescript
const handleBookNow = async (vehicle: Car) => {
  await updateVehicle(vehicle);
  navigate('/browsevehicles/booking');
};
```

### Validate File Upload
```typescript
const handleFileSelect = async (file: File) => {
  const validation = validateFileType(file);
  if (!validation.valid) {
    setError(validation.error);
    return;
  }
  // File is valid
  setFile(file);
};
```

### Create Booking
```typescript
const session = getSession();

const result = await createSecureBooking({
  searchCriteria: session.searchCriteria!,
  vehicle: session.vehicle!,
  renterInfo: session.renterInfo!,
  driveOption: session.driveOption!,
  paymentType: 'full',
  paymentMethod: 'gcash',
  receiptImage: receiptFile
});

if (result.success) {
  navigate('/browsevehicles/receipt-submitted', {
    state: { bookingReference: result.bookingReference }
  });
}
```

### Verify Magic Link
```typescript
const { reference } = useParams();
const [searchParams] = useSearchParams();
const token = searchParams.get('t');

const verification = await verifyMagicToken(reference, token);

if (verification.valid) {
  const booking = await getBookingById(verification.bookingId!);
  // Display booking
}
```

## Route Protection

### Wrap Protected Routes
```tsx
<Route 
  path="/browsevehicles/checkout" 
  element={
    <BookingRouteGuard requiredStep="checkout">
      <CheckoutPage />
    </BookingRouteGuard>
  } 
/>
```

## Data Types

### Session Data
```typescript
interface SessionData {
  sessionId: string;
  step: 'browse' | 'booking' | 'checkout' | 'submitted';
  searchCriteria: SearchCriteria | null;
  vehicle: Car | null;
  renterInfo: RenterInfo | null;
  driveOption: 'self-drive' | 'with-driver' | null;
  agreedToTerms: boolean;
  timestamp: number;
  checksum: string;
}
```

### Booking Response
```typescript
interface BookingResponse {
  success: boolean;
  bookingId: string;
  bookingReference: string; // AR-2026-8K3Z
  magicLink: string; // Full URL with token
  error?: string;
}
```

## Environment Variables

Required in `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_RESEND_API_KEY=your_resend_key (optional)
```

## Database Tables

### bookings
- `id` (UUID, PK)
- `booking_reference` (VARCHAR, UNIQUE)
- `customer_id` (UUID, FK)
- `vehicle_id` (UUID, FK)
- `magic_token_hash` (VARCHAR) - SHA-256 hash
- `token_expires_at` (TIMESTAMP)
- ... other booking fields

### customers
- `id` (UUID, PK)
- `full_name` (VARCHAR)
- `email` (VARCHAR)
- `phone_number` (VARCHAR)
- `drivers_license` (VARCHAR)

### payments
- `id` (UUID, PK)
- `booking_id` (UUID, FK)
- `amount` (DECIMAL)
- `payment_type` ('full' | 'downpayment')
- `payment_method` ('gcash' | 'maya' | 'bank-transfer')
- `receipt_url` (TEXT)

## File Upload Rules

**Allowed:**
- image/jpeg
- image/png
- image/gif

**Rejected:**
- image/svg+xml (XSS risk)
- All other types

**Max Size:** 5MB

## Security Constants

```typescript
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const TOKEN_LENGTH = 32; // 32 bytes
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
```

## Booking Reference Format

```
AR-{YEAR}-{4_CHARS}
Example: AR-2026-8K3Z
```

## Magic Link Format

```
/browsevehicles/track/:reference?t=:token

Example:
/browsevehicles/track/AR-2026-8K3Z?t=abc123xyz...
```

## Error Handling

```typescript
try {
  const result = await createSecureBooking(payload);
  if (!result.success) {
    showError(result.error);
    return;
  }
  // Success
} catch (error) {
  showError('An unexpected error occurred');
}
```

## Testing URLs

**Browse:** `/browsevehicles`  
**Booking:** `/browsevehicles/booking` (requires vehicle in session)  
**Checkout:** `/browsevehicles/checkout` (requires renter info)  
**Receipt:** `/browsevehicles/receipt-submitted` (requires submission)  
**Track:** `/browsevehicles/track/AR-2026-8K3Z?t=token` (requires valid token)

## Debugging

### Check Session
```typescript
console.log('Session:', getSession());
```

### Check Token Validity
```typescript
const expiry = new Date('2026-01-20T10:00:00Z');
console.log('Expired?', isTokenExpired(expiry.toISOString()));
```

### Validate Step Access
```typescript
console.log('Can access checkout?', canAccessStep('checkout'));
```

## Common Issues

### Session Lost
**Cause:** Browser fingerprint changed  
**Fix:** Clear sessionStorage and restart

### Route Guard Redirects
**Cause:** Missing session data  
**Fix:** Complete previous steps

### File Upload Failed
**Cause:** Invalid type or size  
**Fix:** Check validation errors

### Token Verification Failed
**Cause:** Token expired or invalid  
**Fix:** Check expiry and URL encoding
