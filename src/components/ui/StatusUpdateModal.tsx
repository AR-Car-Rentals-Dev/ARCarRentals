import { type FC, useState } from 'react';
import {
  Clock,
  CheckCircle,
  Car,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { supabase } from '@services/supabase';

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  booking: {
    id: string;
    booking_number?: string;
    status?: string;
  } | null;
}

const statuses = [
  {
    value: 'pending',
    label: 'Pending',
    description: 'Awaiting confirmation',
    icon: Clock,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
    selectedBg: 'bg-yellow-100 border-yellow-500 ring-2 ring-yellow-500/20',
  },
  {
    value: 'confirmed',
    label: 'Confirmed',
    description: 'Booking confirmed',
    icon: CheckCircle,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    selectedBg: 'bg-blue-100 border-blue-500 ring-2 ring-blue-500/20',
  },
  {
    value: 'active',
    label: 'Active',
    description: 'Currently rented',
    icon: Car,
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-200 hover:bg-green-100',
    selectedBg: 'bg-green-100 border-green-500 ring-2 ring-green-500/20',
  },
  {
    value: 'completed',
    label: 'Completed',
    description: 'Rental finished',
    icon: CheckCircle,
    color: 'text-neutral-600',
    bg: 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100',
    selectedBg: 'bg-neutral-100 border-neutral-500 ring-2 ring-neutral-500/20',
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
    description: 'Booking cancelled',
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200 hover:bg-red-100',
    selectedBg: 'bg-red-100 border-red-500 ring-2 ring-red-500/20',
  },
];

/**
 * Status Update Modal
 */
export const StatusUpdateModal: FC<StatusUpdateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  booking,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>(booking?.status || 'pending');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset selected status when modal opens
  useState(() => {
    if (booking?.status) {
      setSelectedStatus(booking.status);
    }
  });

  const handleUpdate = async () => {
    if (!booking?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          status: selectedStatus,
          updated_at: new Date().toISOString(),
          ...(selectedStatus === 'cancelled' ? { cancelled_at: new Date().toISOString() } : {}),
        })
        .eq('id', booking.id);

      if (updateError) throw updateError;

      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Error updating status:', err);
      setError(err.message || 'Failed to update status');
    } finally {
      setIsLoading(false);
    }
  };

  if (!booking) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
      <div className="space-y-5">
        {/* Header */}
        <div>
          <h2 className="text-lg font-bold text-neutral-900">Update Status</h2>
          <p className="text-sm text-neutral-500">
            Booking: <span className="text-primary-600 font-medium">{booking.booking_number}</span>
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Status Options */}
        <div className="space-y-2">
          {statuses.map((status) => {
            const Icon = status.icon;
            const isSelected = selectedStatus === status.value;
            
            return (
              <button
                key={status.value}
                type="button"
                onClick={() => setSelectedStatus(status.value)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isSelected ? status.selectedBg : status.bg
                }`}
              >
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-white' : 'bg-white/50'}`}>
                  <Icon className={`h-5 w-5 ${status.color}`} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-neutral-900">{status.label}</p>
                  <p className="text-xs text-neutral-500">{status.description}</p>
                </div>
                {isSelected && (
                  <div className={`w-2 h-2 rounded-full ${status.color.replace('text-', 'bg-')}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-neutral-200">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={isLoading || selectedStatus === booking.status}
            className="flex-1 bg-primary-600 hover:bg-primary-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Status'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default StatusUpdateModal;
