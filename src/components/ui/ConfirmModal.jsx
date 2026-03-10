// src/components/ui/ConfirmModal.jsx
'use client';

import { useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react';

const variants = {
  danger: {
    icon: AlertTriangle,
    iconClass: 'text-red-600 bg-red-100',
    confirmVariant: 'danger',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-yellow-600 bg-yellow-100',
    confirmVariant: 'primary',
  },
  success: {
    icon: CheckCircle,
    iconClass: 'text-green-600 bg-green-100',
    confirmVariant: 'primary',
  },
  info: {
    icon: Info,
    iconClass: 'text-blue-600 bg-blue-100',
    confirmVariant: 'primary',
  },
};

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'info',
  loading = false,
}) {
  const overlayRef = useRef(null);
  const confirmButtonRef = useRef(null);

  const { icon: Icon, iconClass, confirmVariant } = variants[variant];

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus confirm button when modal opens
  useEffect(() => {
    if (isOpen && confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  return (
    // Overlay
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6">
          {/* Icon + Title */}
          <div className="flex items-start gap-4 mb-4">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
              iconClass
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="modal-title"
                className="text-base font-semibold text-zinc-900"
              >
                {title}
              </h2>
              {description && (
                <p
                  id="modal-description"
                  className="text-sm text-zinc-500 mt-1"
                >
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              {cancelLabel}
            </Button>
            <Button
              ref={confirmButtonRef}
              variant={confirmVariant}
              onClick={onConfirm}
              loading={loading}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}