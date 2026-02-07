import { type FC } from 'react';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
  errorMessage?: string | null;
}

/**
 * Confirmation Dialog for delete/destructive actions
 */
export const ConfirmDialog: FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
  errorMessage = null,
}) => {
  const iconColors = {
    danger: 'bg-red-100 text-red-600',
    warning: 'bg-yellow-100 text-yellow-600',
    info: 'bg-blue-100 text-blue-600',
  };

  const buttonColors = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        {/* Icon */}
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${iconColors[variant]} mb-4`}>
          {variant === 'danger' ? (
            <Trash2 className="h-8 w-8" />
          ) : (
            <AlertTriangle className="h-8 w-8" />
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-neutral-900 mb-2">{title}</h3>

        {/* Message */}
        <p className="text-neutral-500 mb-6">{message}</p>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <p className="text-sm text-red-600 leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className={`flex-1 ${buttonColors[variant]}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
