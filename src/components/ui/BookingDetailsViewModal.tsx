import { type FC, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, User, Car, Calendar, MapPin, CreditCard, FileText, Phone, Mail, 
  CheckCircle, XCircle, Clock, AlertCircle, Receipt 
} from 'lucide-react';
import { SmartDeclineModal } from './SmartDeclineModal';
import { bookingService } from '@/services/adminBookingService';
import { sendBookingConfirmedEmail } from '@/services/emailService';

interface Customer {
  id: string;
  full_name: string;
  email: string;
  contact_number: string;
  address?: string;
}

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  transmission: string;
  fuel_type: string;
  seats: number;
  price_per_day: number;
  image_url?: string;
}

interface Payment {
  id: string;
  payment_status: string;
  payment_method: string;
  amount: number;
  transaction_reference?: string;
  receipt_url?: string;
  payment_proof_url?: string;
  paid_at?: string;
}

interface Booking {
  id: string;
  booking_reference: string;
  customer_id: string;
  vehicle_id: string;
  start_date: string;
  start_time?: string;
  rental_days: number;
  pickup_location: string;
  pickup_time?: string;
  total_amount: number;
  booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  customers?: Customer;
  vehicles?: Vehicle;
  payments?: Payment[];
}

interface BookingDetailsViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: (Booking & { booking_status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refund_pending' | 'refunded' }) | null;
  onStatusUpdate?: () => void;
}

/**
 * Booking Details Modal - Shows complete booking information with actions
 * Uses React Portal to render at document.body level
 * Includes Accept/Decline functionality for pending bookings
 */
export const BookingDetailsViewModal: FC<BookingDetailsViewModalProps> = ({
  isOpen,
  onClose,
  booking,
  onStatusUpdate,
}) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [receiptError, setReceiptError] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!isOpen || !booking) return null;

  const customer = booking.customers;
  const vehicle = booking.vehicles;
  const payment = booking.payments?.[0];
  const receiptUrl = payment?.payment_proof_url || payment?.receipt_url;

  const handleAccept = async () => {
    if (!customer) {
      setActionError('Customer information is missing');
      return;
    }

    setIsAccepting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      // Update booking status to confirmed
      const { error: updateError } = await bookingService.updateStatus(booking.id, 'confirmed');
      
      if (updateError) {
        throw new Error(updateError);
      }

      // Send confirmation email
      const emailResult = await sendBookingConfirmedEmail(
        customer.email,
        booking.booking_reference,
        {
          vehicleName: vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehicle',
          pickupDate: new Date(booking.start_date).toLocaleDateString(),
          returnDate: new Date(new Date(booking.start_date).getTime() + booking.rental_days * 24 * 60 * 60 * 1000).toLocaleDateString(),
          pickupLocation: booking.pickup_location || 'Not specified',
          totalPrice: booking.total_amount,
        }
      );

      if (!emailResult.success) {
        console.warn('Email failed to send:', emailResult.error);
      }

      setActionSuccess('✅ Booking confirmed successfully! Confirmation email sent to customer.');
      
      // Close modal and refresh list after short delay
      setTimeout(() => {
        onStatusUpdate?.();
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error accepting booking:', error);
      setActionError(error instanceof Error ? error.message : 'Failed to accept booking');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleClose = () => {
    if (!isAccepting) {
      setActionSuccess(null);
      setActionError(null);
      setReceiptError(false);
      onClose();
    }
  };

  const getStatusBadge = () => {
    const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
      pending: { color: 'bg-amber-100 text-amber-800', icon: Clock, label: 'Pending' },
      confirmed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Confirmed' },
      completed: { color: 'bg-gray-100 text-gray-800', icon: CheckCircle, label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelled' },
    };

    const config = statusConfig[booking.booking_status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const modalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      style={{ zIndex: 99999 }}
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-2.5 rounded-lg">
              <FileText className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Reference: <span className="font-semibold text-gray-700">{booking.booking_reference}</span>
              </p>
            </div>
            {getStatusBadge()}
          </div>
          <button
            onClick={handleClose}
            disabled={isAccepting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Success/Error Messages */}
        {actionSuccess && (
          <div className="mx-6 mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {actionSuccess}
            </p>
          </div>
        )}

        {actionError && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {actionError}
            </p>
          </div>
        )}

        {/* Content Grid */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
              </div>
              {customer ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Full Name</p>
                    <p className="text-base font-medium text-gray-900">{customer.full_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                      <a 
                        href={`mailto:${customer.email}`}
                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {customer.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                      <a 
                        href={`tel:${customer.contact_number}`}
                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {customer.contact_number}
                      </a>
                    </div>
                  </div>
                  {customer.address && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Address</p>
                      <p className="text-sm text-gray-700">{customer.address}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Customer information not available</p>
              )}
            </div>

            {/* Vehicle Information */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Car className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">Vehicle Information</h3>
              </div>
              {vehicle ? (
                <div className="space-y-3">
                  {vehicle.image_url && (
                    <div className="rounded-lg overflow-hidden bg-gray-200">
                      <img
                        src={vehicle.image_url}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="w-full h-40 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x200?text=No+Image';
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Vehicle</p>
                    <p className="text-lg font-bold text-gray-900">
                      {vehicle.brand} {vehicle.model}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Vehicle information not available</p>
              )}
            </div>

            {/* Booking Details */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">Booking Details</h3>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Start Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(booking.start_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Rental Days</p>
                    <p className="text-sm font-medium text-gray-900">{booking.rental_days} day(s)</p>
                  </div>
                </div>
                {booking.start_time && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Start Time</p>
                    <p className="text-sm font-medium text-gray-900">{booking.start_time}</p>
                  </div>
                )}
                {booking.pickup_location && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Location</p>
                      <p className="text-sm text-gray-700">{booking.pickup_location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Payment Receipt */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Receipt className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">Payment Receipt</h3>
              </div>
              
              {receiptUrl ? (
                <div className="space-y-3">
                  {!receiptError ? (
                    <div className="rounded-lg overflow-hidden border-2 border-gray-300 bg-white">
                      {receiptUrl.toLowerCase().endsWith('.pdf') ? (
                        <iframe
                          src={receiptUrl}
                          className="w-full h-96"
                          title="Payment Receipt PDF"
                          onError={() => setReceiptError(true)}
                        />
                      ) : (
                        <img
                          src={receiptUrl}
                          alt="Payment Receipt"
                          className="w-full h-auto max-h-96 object-contain"
                          onError={() => setReceiptError(true)}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                      <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-3" />
                      <p className="text-sm font-medium text-amber-900 mb-2">Receipt unavailable</p>
                      <p className="text-xs text-amber-700 mb-3">
                        The receipt could not be loaded. It may have been moved or deleted.
                      </p>
                      <a
                        href={receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Try opening in new tab →
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 text-center">
                  <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-700">No receipt uploaded</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Customer has not provided a payment receipt yet.
                  </p>
                </div>
              )}
            </div>

            {/* Payment Information */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Rental Days</span>
                  <span className="text-sm font-medium text-gray-900">
                    {booking.rental_days} day(s)
                  </span>
                </div>
                {payment && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Payment Status</span>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {payment.payment_status}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-gray-900">Total Amount</span>
                    <span className="text-xl font-bold text-red-600">
                      ₱{booking.total_amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Only show for pending bookings */}
            {booking.booking_status === 'pending' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Booking Approval Required
                </h4>
                <p className="text-xs text-blue-800 mb-4">
                  Review the payment receipt and customer details. Accept to confirm the booking or decline if there are issues.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleAccept}
                    disabled={isAccepting}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isAccepting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Accepting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Accept
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowDeclineModal(true)}
                    disabled={isAccepting}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Decline
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center rounded-b-xl">
          <p className="text-xs text-gray-500">
            Created: {new Date(booking.created_at).toLocaleString()}
          </p>
          <button
            onClick={handleClose}
            disabled={isAccepting}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Smart Decline Modal */}
      <SmartDeclineModal
        isOpen={showDeclineModal}
        booking={booking as any}
        onClose={() => {
          setShowDeclineModal(false);
        }}
        onDeclineComplete={() => {
          setShowDeclineModal(false);
          setActionSuccess('✅ Booking declined successfully! Customer has been notified.');
          setTimeout(() => {
            onStatusUpdate?.();
            onClose();
          }, 2000);
        }}
      />
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default BookingDetailsViewModal;
