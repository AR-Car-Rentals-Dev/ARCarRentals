import { type FC, useState, useRef } from 'react';
import { X, Upload, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { supabase } from '@services/supabase';
import { sendBookingDeclinedEmail, sendRefundCompletedEmail } from '@services/emailService';

interface Payment {
  id: string;
  payment_status: string;
  payment_method: string;
  amount: number;
  receipt_url?: string;
  payment_proof_url?: string;
}

interface BookingWithPayment {
  id: string;
  booking_reference: string;
  total_amount: number;
  payments?: Payment[];
  customers?: {
    full_name: string;
    email: string;
  };
  vehicles?: {
    brand: string;
    model: string;
  };
}

interface SmartDeclineModalProps {
  isOpen: boolean;
  booking: BookingWithPayment | null;
  onClose: () => void;
  onDeclineComplete: () => void;
}

type DeclineReason = 'payment_failed' | 'vehicle_unavailable' | 'other';

/**
 * Smart Decline Modal
 * Intelligently handles booking declines based on payment status:
 * - No/Fake Payment: Simple cancellation
 * - Valid Payment: Requires refund proof before completing
 */
export const SmartDeclineModal: FC<SmartDeclineModalProps> = ({
  isOpen,
  booking,
  onClose,
  onDeclineComplete,
}) => {
  const [step, setStep] = useState<'reason' | 'refund'>('reason');
  const [declineReason, setDeclineReason] = useState<DeclineReason>('payment_failed');
  const [customReason, setCustomReason] = useState('');
  const [refundReferenceId, setRefundReferenceId] = useState('');
  const [refundProofFile, setRefundProofFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if payment is valid
  const hasValidPayment = booking?.payments && 
    booking.payments.length > 0 && 
    (booking.payments[0].payment_status === 'paid' || 
     booking.payments[0].payment_status === 'pending');

  const resetModal = () => {
    setStep('reason');
    setDeclineReason('payment_failed');
    setCustomReason('');
    setRefundReferenceId('');
    setRefundProofFile(null);
    setUploadProgress(0);
  };

  const handleClose = () => {
    if (!isProcessing) {
      resetModal();
      onClose();
    }
  };

  const getReasonText = (): string => {
    switch (declineReason) {
      case 'payment_failed':
        return customReason || 'Payment verification failed. The receipt provided appears to be invalid or we did not receive payment.';
      case 'vehicle_unavailable':
        return customReason || 'Unfortunately, the vehicle is no longer available for your selected dates.';
      case 'other':
        return customReason || 'Booking declined by administrator.';
      default:
        return customReason;
    }
  };

  const handleReasonSubmit = () => {
    // If no valid payment or payment failed selected, process cancellation directly
    if (!hasValidPayment || declineReason === 'payment_failed') {
      handleCancellation();
    } else {
      // Valid payment, need refund proof
      setStep('refund');
    }
  };

  const handleCancellation = async () => {
    if (!booking) return;

    setIsProcessing(true);
    try {
      const reasonText = getReasonText();

      // Cancel booking (no refund needed)
      const { error } = await supabase
        .from('bookings')
        .update({
          booking_status: 'cancelled',
          cancellation_reason: reasonText,
          refund_status: 'none',
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.id);

      if (error) throw error;

      // Send cancellation email if customer info is available
      if (booking.customers?.email) {
        await sendBookingDeclinedEmail(
          booking.customers.email,
          booking.booking_reference,
          booking.customers.full_name,
          reasonText,
          undefined,
          {
            vehicleName: booking.vehicles ? `${booking.vehicles.brand} ${booking.vehicles.model}` : undefined,
            totalPrice: booking.total_amount,
          }
        );
      }

      handleClose();
      onDeclineComplete();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      const errorMessage = error instanceof Error ? error.message : 
        typeof error === 'object' && error !== null && 'message' in error ? 
        (error as any).message : 'Unknown error';
      alert(`Failed to cancel booking: ${errorMessage}\n\nHave you applied the database migration?`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setRefundProofFile(file);
    }
  };

  const uploadRefundProof = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `refund_${booking!.id}_${Date.now()}.${fileExt}`;
    const filePath = `refund-proofs/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleRefundSubmit = async () => {
    if (!booking || !refundReferenceId.trim() || !refundProofFile) {
      alert('Please provide both refund reference number and proof of refund');
      return;
    }

    setIsProcessing(true);
    setUploadProgress(10);

    try {
      // Upload refund proof
      setUploadProgress(30);
      const refundProofUrl = await uploadRefundProof(refundProofFile);
      setUploadProgress(60);

      const reasonText = getReasonText();

      // Update booking to refunded status
      const { error } = await supabase
        .from('bookings')
        .update({
          booking_status: 'refunded',
          cancellation_reason: reasonText,
          refund_status: 'completed',
          refund_reference_id: refundReferenceId,
          refund_proof_url: refundProofUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.id);

      if (error) throw error;

      setUploadProgress(90);

      // Send refund confirmation email if customer info is available
      if (booking.customers?.email) {
        await sendRefundCompletedEmail(
          booking.customers.email,
          booking.booking_reference,
          {
            vehicleName: booking.vehicles ? `${booking.vehicles.brand} ${booking.vehicles.model}` : 'Vehicle',
            totalPrice: booking.total_amount,
            refundReferenceId: refundReferenceId,
            refundProofUrl: refundProofUrl,
          },
          reasonText
        );
      }

      setUploadProgress(100);
      
      handleClose();
      onDeclineComplete();
    } catch (error) {
      console.error('Error processing refund:', error);
      const errorMessage = error instanceof Error ? error.message : 
        typeof error === 'object' && error !== null && 'message' in error ? 
        (error as any).message : 'Unknown error';
      alert(`Failed to process refund: ${errorMessage}\n\nHave you applied the database migration?`);
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  if (!isOpen || !booking) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-white rounded-xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-white border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {step === 'reason' ? 'Decline Booking' : 'Refund Details'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {booking.booking_reference}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {step === 'reason' ? (
            <>
              {/* Payment Status Alert */}
              {hasValidPayment && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-blue-900">Payment Detected</p>
                    <p className="text-xs text-blue-700 mt-0.5">
                      If payment is valid, you'll need to provide refund proof.
                    </p>
                  </div>
                </div>
              )}

              {/* Decline Reason Selection */}
              <div className="space-y-3 mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Select Decline Reason *
                </label>

                <div className="space-y-2">
                  {/* Payment Failed Option */}
                  <label className={`flex items-start gap-2.5 p-3 border rounded-lg cursor-pointer transition-all ${
                    declineReason === 'payment_failed' 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="declineReason"
                      value="payment_failed"
                      checked={declineReason === 'payment_failed'}
                      onChange={() => setDeclineReason('payment_failed')}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-semibold text-gray-900">Payment Verification Failed</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Invalid receipt or no payment received
                      </p>
                    </div>
                  </label>

                  {/* Vehicle Unavailable Option */}
                  <label className={`flex items-start gap-2.5 p-3 border rounded-lg cursor-pointer transition-all ${
                    declineReason === 'vehicle_unavailable' 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="declineReason"
                      value="vehicle_unavailable"
                      checked={declineReason === 'vehicle_unavailable'}
                      onChange={() => setDeclineReason('vehicle_unavailable')}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-semibold text-gray-900">Vehicle No Longer Available</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Vehicle unavailable for these dates
                      </p>
                    </div>
                  </label>

                  {/* Other Reason Option */}
                  <label className={`flex items-start gap-2.5 p-3 border rounded-lg cursor-pointer transition-all ${
                    declineReason === 'other' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="declineReason"
                      value="other"
                      checked={declineReason === 'other'}
                      onChange={() => setDeclineReason('other')}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-gray-900">Other Reason</span>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Specify your own reason
                      </p>
                    </div>
                  </label>
                </div>

                {/* Custom Reason Input */}
                {(declineReason === 'vehicle_unavailable' || declineReason === 'other') && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Additional Details {declineReason === 'other' && '*'}
                    </label>
                    <textarea
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Provide more details..."
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 mt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReasonSubmit}
                  disabled={isProcessing || (declineReason === 'other' && !customReason.trim())}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isProcessing ? 'Processing...' : hasValidPayment && declineReason !== 'payment_failed' ? 'Continue to Refund' : 'Decline Booking'}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Refund Details Form */}
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-yellow-900">Refund Proof Required</p>
                  <p className="text-xs text-yellow-700 mt-0.5">
                    Provide proof that refund has been sent to customer.
                  </p>
                </div>
              </div>

              {/* Booking Amount */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-700">Amount to Refund:</span>
                  <span className="text-base font-bold text-gray-900">₱{booking.total_amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Refund Reference Number */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Refund Reference Number *
                  </label>
                  <Input
                    type="text"
                    value={refundReferenceId}
                    onChange={(e) => setRefundReferenceId(e.target.value)}
                    placeholder="e.g., GCash Ref #123456789"
                    className="w-full text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Transaction reference from payment provider
                  </p>
                </div>

                {/* Refund Proof Upload */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Upload Refund Receipt/Proof *
                  </label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-1.5" />
                    {refundProofFile ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-green-700">{refundProofFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-gray-600">Click to upload refund proof</p>
                        <p className="text-xs text-gray-500 mt-0.5">PNG, JPG up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Upload Progress */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep('reason')}
                  disabled={isProcessing}
                >
                  Back
                </Button>
                <Button
                  onClick={handleRefundSubmit}
                  disabled={isProcessing || !refundReferenceId.trim() || !refundProofFile}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isProcessing ? 'Processing Refund...' : 'Complete Refund & Decline'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
