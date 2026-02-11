import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { CheckCircle2, Clock, Truck, MapPin, Calendar, Users, Fuel, Mail, Phone, User, ArrowRight } from 'lucide-react';

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';

interface Booking {
  id: string;
  booking_reference: string;
  booking_status: BookingStatus;
  start_date: string;
  rental_days: number;
  pickup_location: string;
  dropoff_location?: string;
  pickup_time: string;
  delivery_method: string;
  drive_option: string;
  total_amount: number;
  created_at: string;
  customer: {
    full_name: string;
    email: string;
    contact_number: string;
  };
  vehicle: {
    brand: string;
    model: string;
    transmission: string;
    seats: string | number;
    image_url: string;
  };
  payment: Array<{
    amount: number;
    payment_type: string;
    payment_method: string;
    payment_status: string;
    receipt_url: string;
  }>;
}

const STEPS = [
  { key: 'placed', label: 'Booking Placed', icon: CheckCircle2 },
  { key: 'accepted', label: 'Booking Accepted', icon: Clock },
  { key: 'completed', label: 'Completed', icon: Truck },
];

const getStepIndex = (status: BookingStatus): number => {
  switch (status) {
    case 'pending': return 0;
    case 'confirmed': return 1;
    case 'completed': return 2;
    case 'cancelled': return -1;
    case 'refunded': return -1;
    default: return 0;
  }
};

const formatDate = (dateStr: string, timeStr?: string) => {
  if (!dateStr) return 'Invalid Date';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Invalid Date';
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  const formattedDate = date.toLocaleDateString('en-US', options);
  if (timeStr) {
    return `${formattedDate} • ${timeStr}`;
  }
  return formattedDate;
};

const getTimeSince = (dateStr: string) => {
  const now = new Date();
  const created = new Date(dateStr);
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

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
      <div className="min-h-[calc(100vh-120px)] bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#E22B2B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-500 text-sm">Loading your booking...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-120px)] bg-neutral-50 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto text-center px-4">
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#E22B2B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Invalid Link</h2>
            <p className="text-neutral-500 mb-6">{error}</p>
            <Link to="/browsevehicles">
              <button className="bg-[#E22B2B] hover:bg-[#c92020] text-white px-6 py-3 rounded-full font-medium transition-colors">
                Browse Vehicles
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const stepIndex = getStepIndex(booking.booking_status);
  const isCancelled = booking.booking_status === 'cancelled' || booking.booking_status === 'refunded';
  const payment = booking.payment?.[0];
  const paymentStatus = payment?.payment_type === 'downpayment'
    ? 'Partial Payment'
    : 'Paid in Full';

  // Compute pickup and return dates
  const pickupDate = new Date(booking.start_date);
  const returnDate = new Date(booking.start_date);
  returnDate.setDate(returnDate.getDate() + (booking.rental_days || 1));

  // Vehicle name
  const vehicleName = `${booking.vehicle.brand} ${booking.vehicle.model}`;

  const statusLabel = booking.booking_status === 'pending'
    ? 'PENDING CONFIRMATION'
    : booking.booking_status === 'confirmed'
      ? 'CONFIRMED'
      : booking.booking_status === 'completed'
        ? 'COMPLETED'
        : booking.booking_status === 'cancelled'
          ? 'CANCELLED'
          : booking.booking_status.toUpperCase();

  const statusColor = booking.booking_status === 'confirmed' || booking.booking_status === 'completed'
    ? 'bg-green-50 text-green-700 border-green-200'
    : booking.booking_status === 'cancelled' || booking.booking_status === 'refunded'
      ? 'bg-red-50 text-red-600 border-red-200'
      : 'bg-orange-50 text-orange-600 border-orange-200';

  const statusDotColor = booking.booking_status === 'confirmed' || booking.booking_status === 'completed'
    ? 'bg-green-500'
    : booking.booking_status === 'cancelled' || booking.booking_status === 'refunded'
      ? 'bg-red-500'
      : 'bg-orange-500';

  return (
    <div className="min-h-[calc(100vh-120px)] bg-neutral-50">
      <div className="w-full max-w-3xl mx-auto px-4 md:px-8 py-10">

        {/* ===== PAGE HEADER ===== */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">Track Your Booking</h1>
          <div className="inline-flex items-center gap-2 bg-white border border-neutral-200 rounded-full px-4 py-1.5 text-sm">
            <span className="text-neutral-400 font-medium uppercase text-xs tracking-wider">Reference:</span>
            <span className="font-bold text-neutral-800 tracking-wide">{booking.booking_reference}</span>
          </div>
        </div>

        {/* ===== BOOKING STATUS CARD ===== */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 mb-5 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Booking Status</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Updated {getTimeSince(booking.created_at)}</p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${statusColor}`}>
              <span className={`w-2 h-2 rounded-full ${statusDotColor}`}></span>
              {statusLabel}
            </span>
          </div>

          {/* Progress Stepper */}
          {!isCancelled && (
            <div className="flex items-start justify-between relative">
              {/* Connecting line */}
              <div className="absolute top-5 left-[40px] right-[40px] h-0.5 bg-neutral-200 z-0"></div>
              <div
                className="absolute top-5 left-[40px] h-0.5 bg-[#E22B2B] z-0 transition-all duration-500"
                style={{ width: `calc(${Math.max(0, stepIndex) / (STEPS.length - 1) * 100}% - 80px)` }}
              ></div>

              {STEPS.map((step, idx) => {
                const isCompleted = idx <= stepIndex;
                const isCurrent = idx === stepIndex;
                const StepIcon = step.icon;

                return (
                  <div key={step.key} className="flex flex-col items-center z-10 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted
                      ? 'bg-[#E22B2B] text-white shadow-md shadow-red-200'
                      : 'bg-neutral-100 text-neutral-400 border-2 border-neutral-200'
                      }`}>
                      <StepIcon className="w-4 h-4" />
                    </div>
                    <p className={`text-xs mt-2 font-medium text-center ${isCompleted ? 'text-neutral-900' : 'text-neutral-400'}`}>
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-[10px] text-neutral-400 mt-0.5 text-center">
                        {idx === 0 ? formatDate(booking.created_at) : ''}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {isCancelled && (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-neutral-600 font-medium">This booking has been {booking.booking_status}</p>
            </div>
          )}
        </div>

        {/* ===== VEHICLE DETAILS CARD ===== */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 mb-5 shadow-sm">
          <div className="flex flex-col md:flex-row gap-5">
            {/* Vehicle Image */}
            <div className="flex-shrink-0">
              <div className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 mb-2">
                {booking.vehicle.transmission || 'N/A'}
              </div>
              {booking.vehicle.image_url ? (
                <img
                  src={booking.vehicle.image_url}
                  alt={vehicleName}
                  className="w-full md:w-44 h-28 object-cover rounded-xl bg-neutral-100"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-car.png';
                    (e.target as HTMLImageElement).onerror = null;
                  }}
                />
              ) : (
                <div className="w-full md:w-44 h-28 rounded-xl bg-neutral-100 flex items-center justify-center">
                  <svg className="w-12 h-12 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
              )}
            </div>

            {/* Vehicle Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-neutral-900">{vehicleName}</h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${booking.drive_option === 'self-drive'
                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                  : 'bg-purple-50 text-purple-600 border-purple-200'
                  }`}>
                  {booking.drive_option === 'self-drive' ? 'SELF-DRIVE' : 'WITH DRIVER'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-neutral-500 mb-5">
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {booking.vehicle.seats} Seats
                </span>
                <span className="inline-flex items-center gap-1">
                  <Fuel className="w-3.5 h-3.5" />
                  Unlimited Mileage
                </span>
              </div>

              {/* Pickup & Return */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold mb-1">Pickup</p>
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#E22B2B] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">{booking.pickup_location}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {formatDate(pickupDate.toISOString(), booking.pickup_time)}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 uppercase tracking-wider font-semibold mb-1">Return</p>
                  <div className="flex items-start gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-neutral-800">
                        {booking.dropoff_location || booking.pickup_location || 'Same Location'}
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {formatDate(returnDate.toISOString(), booking.pickup_time)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== TWO COLUMN: CUSTOMER DETAILS & PAYMENT SUMMARY ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {/* Customer Details */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-900 mb-5">Customer Details</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-neutral-400" />
                </div>
                <div>
                  <p className="text-xs text-neutral-400">Full Name</p>
                  <p className="text-sm font-semibold text-neutral-800">{booking.customer.full_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-neutral-400" />
                </div>
                <div>
                  <p className="text-xs text-neutral-400">Email Address</p>
                  <p className="text-sm font-semibold text-neutral-800">{booking.customer.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-neutral-400" />
                </div>
                <div>
                  <p className="text-xs text-neutral-400">Phone Number</p>
                  <p className="text-sm font-semibold text-neutral-800">{booking.customer.contact_number || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-900 mb-5">Payment Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Payment Method</span>
                <span className="font-semibold text-neutral-800 capitalize">{payment?.payment_method || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Subtotal</span>
                <span className="font-semibold text-neutral-800">₱{booking.total_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Status</span>
                <span className={`font-semibold ${payment?.payment_type === 'downpayment' ? 'text-orange-500' : 'text-green-600'
                  }`}>
                  {paymentStatus}
                </span>
              </div>

              <div className="border-t border-neutral-100 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-neutral-900">Total Amount</span>
                  <span className="text-2xl font-bold text-neutral-900">₱{booking.total_amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== FOOTER CTA ===== */}
        <div className="text-center">
          <Link to="/browsevehicles">
            <button className="inline-flex items-center gap-2 bg-[#E22B2B] hover:bg-[#c92020] text-white px-8 py-3.5 rounded-full font-semibold text-sm transition-all duration-200 shadow-lg shadow-red-200/50 hover:shadow-xl hover:shadow-red-200/60 hover:-translate-y-0.5">
              Browse More Vehicles
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <p className="text-sm text-neutral-400 mt-4">
            Need help? <a href="mailto:info@arcarrentalscebu.com" className="text-[#E22B2B] hover:underline font-medium">Contact Support</a>
          </p>
        </div>

      </div>
    </div>
  );
};
