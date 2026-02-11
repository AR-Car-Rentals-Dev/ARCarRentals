import type { FC } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import { useEffect } from 'react';

export interface ToastProps {
    message: string;
    type?: 'success' | 'error';
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

export const Toast: FC<ToastProps> = ({
    message,
    type = 'success',
    isVisible,
    onClose,
    duration = 3000,
}) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [isVisible, duration, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
            <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${type === 'success'
                    ? 'bg-white border-green-100 text-green-800'
                    : 'bg-white border-red-100 text-red-800'
                    }`}
            >
                {type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                )}
                <p className="text-sm font-medium">{message}</p>
                <button
                    onClick={onClose}
                    className={`ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors ${type === 'success' ? 'text-green-600' : 'text-red-600'
                        }`}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
