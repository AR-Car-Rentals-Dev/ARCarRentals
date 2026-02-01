import { type FC, useState } from 'react';
import {
  Calendar,
  User,
  Car,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Receipt,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { supabase } from '../../services/supabase';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: () => void;
  booking: {
    id: string;
    booking_number?: string;
    customer_name?: string | null;
    customer_phone?: string | null;
    customer_email?: string | null;
    pickup_date?: string;
    return_date?: string;
    pickup_location?: string;
    pickup_delivery_location?: string;
    total_days?: number;
    base_price?: number;
    extras_price?: number;
    location_cost?: number;
    driver_cost?: number;
    total_price?: number;
    total_amount?: number;
    status?: string;
    payment_method?: string;
    payment_receipt_url?: string | null;
    drive_option?: string;
    start_time?: string;
    end_time?: string;
    created_at?: string;
    vehicles?: {
      brand?: string;
      model?: string;
      thumbnail?: string;
      image_url?: string;
    } | null;
    users?: {
      full_name?: string;
      phone_number?: string;
      email?: string;
    } | null;
  } | null;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'completed', label: 'Completed', color: 'bg-neutral-100 text-neutral-700 border-neutral-300' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-300' },
];

const StatusBadge: FC<{ status: string; onClick?: () => void }> = ({ status, onClick }) => {
  const config: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    confirmed: { bg: 'bg-blue-100', text: 'text-blue-700' },
    active: { bg: 'bg-green-100', text: 'text-green-700' },
    completed: { bg: 'bg-neutral-100', text: 'text-neutral-700' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
  };

  const { bg, text } = config[status] || config.pending;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bg} ${text} hover:opacity-80 transition-opacity cursor-pointer`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </button>
  );
};

/**
 * Booking Details Modal - with status update capability
 */
export const BookingDetailsModal: FC<BookingDetailsModalProps> = ({
  isOpen,
  onClose,
  onStatusUpdate,
  booking,
}) => {
  const [showStatusSelector, setShowStatusSelector] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(booking?.status || 'pending');
  const [isUpdating, setIsUpdating] = useState(false);

  // Update currentStatus when booking changes
  if (booking && booking.status !== currentStatus && !isUpdating) {
    setCurrentStatus(booking.status || 'pending');
  }

  if (!booking) return null;

  const customerName = booking.customer_name || booking.users?.full_name || 'Guest';
  const customerPhone = booking.customer_phone || booking.users?.phone_number || 'N/A';
  const customerEmail = booking.customer_email || booking.users?.email || 'N/A';
  const totalAmount = booking.total_amount || booking.total_price || 0;
  const vehicleImage = booking.vehicles?.image_url || booking.vehicles?.thumbnail;

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', booking.id);

      if (error) throw error;

      setCurrentStatus(newStatus);
      setShowStatusSelector(false);
      onStatusUpdate?.();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">Booking Details</h2>
            <p className="text-primary-600 font-medium">{booking.booking_number}</p>
          </div>
          <div className="relative">
            <StatusBadge 
              status={currentStatus} 
              onClick={() => setShowStatusSelector(!showStatusSelector)} 
            />
            
            {/* Status Selector Dropdown */}
            {showStatusSelector && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-neutral-200 p-2 min-w-[160px] z-50">
                <p className="text-xs text-neutral-500 px-2 pb-2 border-b border-neutral-100">Update Status</p>
                <div className="pt-2 space-y-1">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleStatusChange(option.value)}
                      disabled={isUpdating || option.value === currentStatus}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        option.value === currentStatus
                          ? `${option.color} border`
                          : 'hover:bg-neutral-100 text-neutral-700'
                      } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        {isUpdating && option.value !== currentStatus && (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        )}
                        {option.label}
                        {option.value === currentStatus && (
                          <span className="text-xs opacity-75">(current)</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Image - Large */}
        {vehicleImage && (
          <div className="rounded-xl overflow-hidden bg-neutral-100">
            <img
              src={vehicleImage}
              alt={booking.vehicles ? `${booking.vehicles.brand} ${booking.vehicles.model}` : 'Vehicle'}
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Vehicle Info */}
        {booking.vehicles && (
          <div className="p-4 bg-neutral-50 rounded-xl">
            <div className="flex items-center gap-2 text-neutral-600 text-sm mb-2">
              <Car className="h-4 w-4" />
              <span>Vehicle</span>
            </div>
            <p className="font-semibold text-neutral-900 text-lg">
              {booking.vehicles.brand} {booking.vehicles.model}
            </p>
            <p className="text-sm text-neutral-500">
              {booking.drive_option === 'with-driver' ? 'With Driver' : 'Self-Drive'}
            </p>
          </div>
        )}

        {/* Customer Info */}
        <div className="p-4 bg-neutral-50 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-neutral-600 text-sm">
            <User className="h-4 w-4" />
            <span>Customer Information</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-neutral-400" />
              <span className="font-medium text-neutral-900">{customerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-neutral-400" />
              <span className="text-neutral-700">{customerPhone}</span>
            </div>
            {customerEmail !== 'N/A' && (
              <div className="flex items-center gap-2 col-span-2">
                <Mail className="h-4 w-4 text-neutral-400" />
                <span className="text-neutral-700">{customerEmail}</span>
              </div>
            )}
          </div>
        </div>

        {/* Rental Period */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-neutral-50 rounded-xl">
            <div className="flex items-center gap-2 text-neutral-600 text-sm mb-2">
              <Calendar className="h-4 w-4" />
              <span>Pickup</span>
            </div>
            <p className="font-semibold text-neutral-900">
              {booking.pickup_date ? new Date(booking.pickup_date).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) : 'N/A'}
            </p>
            {booking.start_time && (
              <p className="text-sm text-neutral-500">{booking.start_time}</p>
            )}
          </div>
          <div className="p-4 bg-neutral-50 rounded-xl">
            <div className="flex items-center gap-2 text-neutral-600 text-sm mb-2">
              <Calendar className="h-4 w-4" />
              <span>Return</span>
            </div>
            <p className="font-semibold text-neutral-900">
              {booking.return_date ? new Date(booking.return_date).toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) : 'N/A'}
            </p>
            {booking.end_time && (
              <p className="text-sm text-neutral-500">{booking.end_time}</p>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="p-4 bg-neutral-50 rounded-xl">
          <div className="flex items-center gap-2 text-neutral-600 text-sm mb-2">
            <MapPin className="h-4 w-4" />
            <span>Pickup/Delivery Location</span>
          </div>
          <p className="font-medium text-neutral-900">
            {booking.pickup_delivery_location || booking.pickup_location || 'Office Pickup'}
          </p>
        </div>

        {/* Payment Details */}
        <div className="p-4 bg-neutral-50 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-neutral-600 text-sm">
            <CreditCard className="h-4 w-4" />
            <span>Payment Details</span>
          </div>
          
          <div className="space-y-2 text-sm">
            {booking.base_price && (
              <div className="flex justify-between">
                <span className="text-neutral-600">Base Price ({booking.total_days || 1} days)</span>
                <span className="text-neutral-900">₱{booking.base_price.toLocaleString()}</span>
              </div>
            )}
            {(booking.location_cost || 0) > 0 && (
              <div className="flex justify-between">
                <span className="text-neutral-600">Delivery Fee</span>
                <span className="text-neutral-900">₱{booking.location_cost?.toLocaleString()}</span>
              </div>
            )}
            {(booking.driver_cost || 0) > 0 && (
              <div className="flex justify-between">
                <span className="text-neutral-600">Driver Fee</span>
                <span className="text-neutral-900">₱{booking.driver_cost?.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-neutral-200">
              <span className="font-semibold text-neutral-900">Total</span>
              <span className="font-bold text-primary-600 text-lg">₱{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {booking.payment_method && (
            <div className="text-sm text-neutral-600">
              Payment Method: <span className="font-medium text-neutral-900">
                {booking.payment_method === 'pay_now' ? 'Pay Online' : 'Pay Later (Cash)'}
              </span>
            </div>
          )}
        </div>

        {/* Payment Receipt */}
        {booking.payment_receipt_url && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-2 text-green-700 text-sm mb-3">
              <Receipt className="h-4 w-4" />
              <span className="font-medium">Payment Receipt Uploaded</span>
            </div>
            <div className="relative">
              <img
                src={booking.payment_receipt_url}
                alt="Payment Receipt"
                className="w-full max-h-64 object-contain rounded-lg border border-green-200 bg-white"
              />
              <a
                href={booking.payment_receipt_url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-2 right-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-green-700 rounded-lg text-sm font-medium hover:bg-white transition-colors border border-green-200"
              >
                View Full Image
              </a>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-neutral-200">
          <p className="text-xs text-neutral-500">
            Created: {booking.created_at ? new Date(booking.created_at).toLocaleString() : 'N/A'}
          </p>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BookingDetailsModal;
