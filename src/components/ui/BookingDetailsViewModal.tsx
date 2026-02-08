import { type FC, useState } from 'react';
import { 
  User, Car, Calendar, MapPin, CreditCard, Phone, Mail, 
  CheckCircle, XCircle, Clock, AlertCircle, Receipt 
} from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
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
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
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
      // Note: Vehicle status is no longer changed - booked dates are blocked in calendar instead
      const { error: updateError } = await bookingService.updateStatus(booking.id, 'confirmed', true);
      
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

  const handleConfirmPayment = async () => {
    if (!payment) {
      setActionError('Payment information is missing');
      return;
    }

    setIsConfirmingPayment(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const { error } = await bookingService.confirmPayment(booking.id, payment.id);
      
      if (error) {
        throw new Error(error);
      }

      setActionSuccess('✅ Payment confirmed successfully! Booking is now active.');
      
      // Close modal and refresh list after short delay
      setTimeout(() => {
        onStatusUpdate?.();
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error confirming payment:', error);
      setActionError(error instanceof Error ? error.message : 'Failed to confirm payment');
    } finally {
      setIsConfirmingPayment(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setIsCancelling(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const { error } = await bookingService.updateStatus(booking.id, 'cancelled');
      
      if (error) {
        throw new Error(error);
      }

      setActionSuccess('✅ Booking cancelled successfully!');
      
      // Close modal and refresh list after short delay
      setTimeout(() => {
        onStatusUpdate?.();
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error cancelling booking:', error);
      setActionError(error instanceof Error ? error.message : 'Failed to cancel booking');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!window.confirm('Mark this booking as completed?')) {
      return;
    }

    setIsCancelling(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const { error } = await bookingService.updateStatus(booking.id, 'completed');
      
      if (error) {
        throw new Error(error);
      }

      setActionSuccess('✅ Booking marked as completed!');
      
      // Close modal and refresh list after short delay
      setTimeout(() => {
        onStatusUpdate?.();
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error completing booking:', error);
      setActionError(error instanceof Error ? error.message : 'Failed to complete booking');
    } finally {
      setIsCancelling(false);
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
    // Check if booking is active (confirmed with paid payment)
    const isActive = booking.booking_status === 'confirmed' && payment?.payment_status === 'paid';
    
    const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
      pending: { color: 'bg-amber-100 text-amber-800', icon: Clock, label: 'Pending' },
      confirmed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Confirmed' },
      active: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Active' },
      completed: { color: 'bg-neutral-100 text-neutral-800', icon: CheckCircle, label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelled' },
    };

    const statusKey = isActive ? 'active' : booking.booking_status;
    const config = statusConfig[statusKey] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${config.color}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  // Check if booking is active
  const isActiveBooking = booking.booking_status === 'confirmed' && payment?.payment_status === 'paid';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="" size="2xl">
      {/* Custom Title with Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
          Booking #{booking.booking_reference}
        </h2>
        {getStatusBadge()}
      </div>

      <div className="mb-4 sm:mb-6">
        <p className="text-xs sm:text-sm text-neutral-500">
          Created {new Date(booking.created_at).toLocaleString()}
        </p>
      </div>

      {/* Success/Error Messages */}
      {actionSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm flex items-start gap-2">
          <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-start">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white border border-neutral-200 rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <User className="h-5 w-5 text-primary-600" />
              <h3 className="text-sm sm:text-base font-semibold text-neutral-900">Customer Information</h3>
            </div>
            {customer ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Full Name</p>
                  <p className="text-sm font-medium text-neutral-900">{customer.full_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-neutral-400" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-0.5">Email</p>
                    <a 
                      href={`mailto:${customer.email}`}
                      className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      {customer.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-neutral-400" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-0.5">Phone</p>
                    <a 
                      href={`tel:${customer.contact_number}`}
                      className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      {customer.contact_number}
                    </a>
                  </div>
                </div>
                {customer.address && (
                  <div>
                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Address</p>
                    <p className="text-sm text-neutral-700">{customer.address}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-neutral-500">Customer information not available</p>
            )}
          </div>

          {/* Vehicle Information */}
          <div className="bg-white border border-neutral-200 rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Car className="h-5 w-5 text-primary-600" />
              <h3 className="text-sm sm:text-base font-semibold text-neutral-900">Vehicle Information</h3>
            </div>
            {vehicle ? (
              <div className="space-y-4">
                {vehicle.image_url && (
                  <div className="rounded-lg overflow-hidden border-2 border-neutral-200 bg-neutral-100">
                    <img
                      src={vehicle.image_url}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      className="w-full h-36 sm:h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x200?text=No+Image';
                      }}
                    />
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Vehicle</p>
                  <p className="text-lg font-bold text-neutral-900">
                    {vehicle.brand} {vehicle.model}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Transmission</p>
                    <p className="text-sm text-neutral-700 capitalize">{vehicle.transmission}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Fuel Type</p>
                    <p className="text-sm text-neutral-700 capitalize">{vehicle.fuel_type}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Seats</p>
                    <p className="text-sm text-neutral-700">{vehicle.seats} seats</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Price/Day</p>
                    <p className="text-sm font-semibold text-neutral-900">₱{vehicle.price_per_day.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-neutral-500">Vehicle information not available</p>
            )}
          </div>

          {/* Booking Details */}
          <div className="bg-white border border-neutral-200 rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Calendar className="h-5 w-5 text-primary-600" />
              <h3 className="text-sm sm:text-base font-semibold text-neutral-900">Booking Details</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Start Date</p>
                  <p className="text-sm font-medium text-neutral-900">
                    {new Date(booking.start_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Rental Days</p>
                  <p className="text-sm font-medium text-neutral-900">{booking.rental_days} day(s)</p>
                </div>
              </div>
              {booking.start_time && (
                <div>
                  <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Start Time</p>
                  <p className="text-sm font-medium text-neutral-900">{booking.start_time}</p>
                </div>
              )}
              {booking.pickup_location && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-neutral-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-0.5">Pickup Location</p>
                    <p className="text-sm text-neutral-700">{booking.pickup_location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Payment Receipt */}
          <div className="bg-white border border-neutral-200 rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Receipt className="h-5 w-5 text-primary-600" />
              <h3 className="text-sm sm:text-base font-semibold text-neutral-900">Payment Receipt</h3>
            </div>
            
            {receiptUrl ? (
              <div className="space-y-3">
                {!receiptError ? (
                  <div className="rounded-lg overflow-hidden border-2 border-neutral-200 bg-white">
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
                      className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      Try opening in new tab →
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 text-center">
                <Receipt className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-neutral-700">No receipt uploaded</p>
                <p className="text-xs text-neutral-500 mt-1">
                  Customer has not provided a payment receipt yet.
                </p>
              </div>
            )}
          </div>

          {/* Payment Information */}
          <div className="bg-white border border-neutral-200 rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <CreditCard className="h-5 w-5 text-primary-600" />
              <h3 className="text-sm sm:text-base font-semibold text-neutral-900">Payment Information</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Rental Days</p>
                <p className="text-sm font-medium text-neutral-900">
                  {booking.rental_days} day(s)
                </p>
              </div>
              {payment && (
                <>
                  <div>
                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Payment Method</p>
                    <p className="text-sm font-medium text-neutral-900 capitalize">
                      {payment.payment_method.replace('-', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Payment Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      payment.payment_status === 'completed' || payment.payment_status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : payment.payment_status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-neutral-100 text-neutral-800'
                    }`}>
                      {payment.payment_status.toUpperCase()}
                    </span>
                  </div>
                  {payment.transaction_reference && (
                    <div>
                      <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Payment Reference</p>
                      <p className="text-sm font-medium text-neutral-900 font-mono">
                        {payment.transaction_reference}
                      </p>
                    </div>
                  )}
                  {payment.paid_at && (
                    <div>
                      <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Payment Date</p>
                      <p className="text-sm font-medium text-neutral-900">
                        {new Date(payment.paid_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </>
              )}
              <div className="border-t border-neutral-200 pt-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-neutral-500 uppercase tracking-wide">Total Amount</span>
                </div>
                <div className="flex justify-end">
                  <span className="text-2xl font-bold text-[#E22B2B]">
                    ₱{booking.total_amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Only show for pending bookings */}
          {booking.booking_status === 'pending' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
              <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Booking Approval Required
              </h4>
              <p className="text-xs text-blue-800 mb-4">
                Review the payment receipt and customer details. Accept to confirm the booking or decline if there are issues.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleAccept}
                  disabled={isAccepting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isAccepting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Accepting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Accept
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowDeclineModal(true)}
                  disabled={isAccepting}
                  variant="outline"
                  className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Decline
                </Button>
              </div>
            </div>
          )}

          {/* Payment Confirmation - Show for confirmed bookings with pending payment */}
          {booking.booking_status === 'confirmed' && payment && payment.payment_status === 'pending' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
              <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Payment Confirmation Required
              </h4>
              <p className="text-xs text-blue-800 mb-4">
                Review the payment and confirm once verified. This will activate the booking.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleConfirmPayment}
                  disabled={isConfirmingPayment}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isConfirmingPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Confirm Payment
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mt-6 sm:mt-8 pt-6 border-t border-neutral-200">
        {booking.booking_status !== 'completed' && (
          isActiveBooking ? (
            <Button
              variant="outline"
              onClick={handleMarkComplete}
              disabled={isAccepting || isConfirmingPayment || isCancelling}
              className="w-full sm:w-auto px-6 border-green-600 text-green-600 hover:bg-green-50"
            >
              {isCancelling ? 'Processing...' : 'Mark as Complete'}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleCancelBooking}
              disabled={isAccepting || isConfirmingPayment || isCancelling || booking.booking_status === 'cancelled'}
              className="w-full sm:w-auto px-6 border-red-600 text-red-600 hover:bg-red-50"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
            </Button>
          )
        )}
        <Button
          variant="outline"
          onClick={handleClose}
          disabled={isAccepting || isConfirmingPayment || isCancelling}
          className="w-full sm:w-auto px-6 sm:ml-auto"
        >
          Close
        </Button>
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
    </Modal>
  );
};

export default BookingDetailsViewModal;
