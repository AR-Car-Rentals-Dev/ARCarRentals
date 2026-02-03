import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle } from 'lucide-react';

interface DeclineReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, customMessage?: string) => Promise<void>;
  bookingReference: string;
}

const PREDEFINED_REASONS = [
  'Payment verification failed',
  'Invalid or unclear payment receipt',
  'Vehicle no longer available',
  'Booking dates conflict with existing reservation',
  'Customer information incomplete or incorrect',
  'Payment amount does not match booking total',
  'Fraudulent activity suspected',
  'Other (please specify in message below)',
];

export const DeclineReasonModal: React.FC<DeclineReasonModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  bookingReference,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedReason('');
      setCustomMessage('');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedReason) {
      setError('Please select a decline reason');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit(selectedReason, customMessage || undefined);
      // Don't close here - parent will close after success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decline booking');
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      style={{ zIndex: 99999 }}
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Decline Booking</h2>
              <p className="text-sm text-gray-500">Ref: {bookingReference}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Warning Message */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>⚠️ Important:</strong> Declining this booking will notify the customer via email.
              Please provide a clear reason to help them understand the decision.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            </div>
          )}

          {/* Decline Reason Dropdown */}
          <div>
            <label htmlFor="decline-reason" className="block text-sm font-semibold text-gray-700 mb-2">
              Decline Reason <span className="text-red-500">*</span>
            </label>
            <select
              id="decline-reason"
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
              required
            >
              <option value="">Select a reason...</option>
              {PREDEFINED_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              This reason will be included in the email sent to the customer
            </p>
          </div>

          {/* Optional Custom Message */}
          <div>
            <label htmlFor="custom-message" className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Message (Optional)
            </label>
            <textarea
              id="custom-message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              disabled={isSubmitting}
              placeholder="Add any additional details or instructions for the customer..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Provide any additional context or next steps for the customer
            </p>
          </div>

          {/* Refund Information Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">📋 Refund Information</h4>
            <p className="text-xs text-blue-800 leading-relaxed">
              The decline email will automatically include refund instructions. The customer will be informed
              that they can contact support at <strong>info@arcarrentals.com</strong> or call <strong>+63 123 456 7890</strong> to
              process their refund within 5-7 business days.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedReason}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Declining...
                </>
              ) : (
                'Decline Booking'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
