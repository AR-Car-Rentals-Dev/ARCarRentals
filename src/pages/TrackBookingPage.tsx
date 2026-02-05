import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Container } from '../components/ui/Container';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';

interface Booking {
  id: string;
  booking_reference: string;
  booking_status: BookingStatus;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  pickup_time: string;
  delivery_method: string;
  drive_option: string;
  total_amount: number;
  customer: {
    full_name: string;
    email: string;
    phone_number: string;
  };
  vehicle: {
    name: string;
    make: string;
    model: string;
    year: number;
    transmission: string;
    seats: number;
    imageUrl: string;
  };
  payment: Array<{
    amount: number;
    payment_type: string;
    payment_method: string;
    payment_status: string;
    receipt_url: string;
  }>;
}

export const TrackBookingPage = () => {
  const { reference } = useParams<{ reference: string }>();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  
  useEffect(() => {
    const loadBooking = async () => {
      if (!reference) {
        setError('Invalid tracking link - no booking reference provided');
        setLoading(false);
        return;
      }

      try {
        // Fetch booking by reference
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select(`
            *,
            customer:customers(*),
            vehicle:vehicles(*),
            payment:payments(*)
          `)
          .eq('booking_reference', reference)
          .single();

        if (bookingError) throw bookingError;
        if (!bookingData) {
          setError('Booking not found');
          setLoading(false);
          return;
        }

        setBooking(bookingData);
      } catch (err) {
        console.error('Error loading booking:', err);
        setError(err instanceof Error ? err.message : 'Failed to load booking');
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [reference]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#E22B2B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your booking...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Container>
          <Card className="max-w-md mx-auto text-center p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#E22B2B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link to="/browsevehicles">
              <Button>Browse Vehicles</Button>
            </Link>
          </Card>
        </Container>
      </div>
    );
  }
  
  if (!booking) return null;
  
  const getStatusColor = (status: BookingStatus): 'success' | 'danger' | 'primary' | 'warning' => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'cancelled': return 'danger';
      case 'completed': return 'primary';
      default: return 'warning';
    }
  };
  
  const payment = booking.payment[0];
  const balanceDue = payment.payment_type === 'downpayment' 
    ? booking.total_amount - payment.amount 
    : 0;
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Booking</h1>
            <p className="text-gray-600">Booking Reference: <span className="font-semibold">{booking.booking_reference}</span></p>
          </div>
          
          {/* Status */}
          <Card className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Booking Status</h3>
                <Badge variant={getStatusColor(booking.booking_status)}>
                  {booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1)}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Payment Status</p>
                <Badge variant={payment.payment_status === 'confirmed' ? 'success' : 'warning'}>
                  {payment.payment_status?.charAt(0).toUpperCase() + payment.payment_status.slice(1)}
                </Badge>
              </div>
            </div>
          </Card>
          
          {/* Vehicle Details */}
          <Card className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Details</h3>
            <div className="flex gap-4">
              <img 
                src={booking.vehicle.imageUrl} 
                alt={booking.vehicle.name}
                className="w-32 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{booking.vehicle.name}</h4>
                <p className="text-sm text-gray-600">
                  {booking.vehicle.year} {booking.vehicle.make} {booking.vehicle.model}
                </p>
                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                  <span>{booking.vehicle.transmission}</span>
                  <span>•</span>
                  <span>{booking.vehicle.seats} Seats</span>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Trip Details */}
          <Card className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Pickup Location</p>
                <p className="font-medium text-gray-900">{booking.pickup_location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Delivery Method</p>
                <p className="font-medium text-gray-900 capitalize">{booking.delivery_method}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pickup Date & Time</p>
                <p className="font-medium text-gray-900">
                  {new Date(booking.pickup_date).toLocaleDateString()} at {booking.pickup_time}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Return Date</p>
                <p className="font-medium text-gray-900">
                  {new Date(booking.return_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Drive Option</p>
                <p className="font-medium text-gray-900 capitalize">
                  {booking.drive_option === 'with-driver' ? 'With Driver' : 'Self-Drive'}
                </p>
              </div>
            </div>
          </Card>
          
          {/* Payment Summary */}
          <Card className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Type</span>
                <span className="font-medium text-gray-900 capitalize">
                  {payment.payment_type === 'downpayment' ? 'Downpayment' : 'Full Payment'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-medium text-gray-900 uppercase">
                  {payment.payment_method}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid</span>
                <span className="font-medium text-gray-900">₱{payment.amount.toLocaleString()}</span>
              </div>
              {balanceDue > 0 && (
                <div className="flex justify-between pt-3 border-t">
                  <span className="text-gray-900 font-semibold">Balance Due</span>
                  <span className="text-[#E22B2B] font-semibold">₱{balanceDue.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t">
                <span className="text-gray-900 font-semibold">Total Amount</span>
                <span className="font-semibold text-gray-900">₱{booking.total_amount.toLocaleString()}</span>
              </div>
            </div>
            
            {payment.receipt_url && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Payment Receipt</p>
                <img 
                  src={payment.receipt_url} 
                  alt="Payment Receipt"
                  className="w-full max-w-xs rounded-lg border"
                />
              </div>
            )}
          </Card>
          
          {/* Customer Information */}
          <Card className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-medium text-gray-900">{booking.customer.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{booking.customer.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone Number</p>
                <p className="font-medium text-gray-900">{booking.customer.phone_number}</p>
              </div>
            </div>
          </Card>
          
          {/* Actions */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              Need help? Contact us at support@arcarrentals.com
            </p>
            <Link to="/browsevehicles">
              <Button variant="secondary">Browse More Vehicles</Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};
