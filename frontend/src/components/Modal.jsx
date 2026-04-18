import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Themed Modal Component
 * Matches the Namma Sambandhi design system with custom colors and animations
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md', // sm, md, lg
  variant = 'default', // default, error, success, warning
}) => {
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  if (!isVisible) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  const variantClasses = {
    default: {
      bg: 'bg-white',
      border: 'border-0',
      titleColor: 'text-charcoal',
      headerBg: 'bg-ivory',
    },
    error: {
      bg: 'bg-white',
      border: 'border-l-4 border-red-500',
      titleColor: 'text-red-700',
      headerBg: 'bg-red-50',
    },
    success: {
      bg: 'bg-white',
      border: 'border-l-4 border-green-500',
      titleColor: 'text-green-700',
      headerBg: 'bg-green-50',
    },
    warning: {
      bg: 'bg-white',
      border: 'border-l-4 border-amber-500',
      titleColor: 'text-amber-700',
      headerBg: 'bg-amber-50',
    },
  };

  const variant_style = variantClasses[variant] || variantClasses.default;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.4)' }}
      onClick={handleBackdropClick}
    >
      {/* Modal Container */}
      <div
        className={`
          ${sizeClasses[size]}
          ${variant_style.bg}
          ${variant_style.border}
          rounded-lg
          shadow-lg
          flex flex-col
          max-h-[90vh]
          overflow-hidden
          animate-in fade-in zoom-in-95
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${variant_style.headerBg} px-6 py-4 flex items-center justify-between border-b border-stone-paper`}>
          <h2 className={`text-lg font-semibold ${variant_style.titleColor}`}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/50 rounded-md transition-colors"
          >
            <X size={20} className="text-text-charcoal" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 text-charcoal">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 bg-stone-paper border-t border-stone-paper flex gap-3 justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Alert Modal Component
 * Simple one-button modal for success/error/warning messages
 */
export const AlertModal = ({
  isOpen,
  onClose,
  title,
  message,
  variant = 'default', // default, error, success, warning
  buttonText = 'OK',
  onConfirm,
}) => {
  const getIcon = () => {
    const iconClasses = 'w-12 h-12';
    switch (variant) {
      case 'error':
        return (
          <div className={`${iconClasses} text-red-500 mx-auto mb-4`}>
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'success':
        return (
          <div className={`${iconClasses} text-green-500 mx-auto mb-4`}>
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className={`${iconClasses} text-amber-500 mx-auto mb-4`}>
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      variant={variant}
      size="md"
      footer={
        <button
          onClick={handleConfirm}
          className={`
            px-6 py-2 rounded-lg font-medium transition-all
            ${variant === 'error'
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : variant === 'success'
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : variant === 'warning'
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-primary hover:bg-rajkumari text-white'
            }
          `}
        >
          {buttonText}
        </button>
      }
    >
      {getIcon()}
      <p className="text-center text-charcoal text-base leading-relaxed">
        {message}
      </p>
    </Modal>
  );
};

/**
 * Confirmation Modal Component
 * Two-button modal for confirm/cancel actions
 */
export const ConfirmModal = ({
  isOpen,
  onClose,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      variant={variant}
      size="md"
      footer={
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 rounded-lg font-medium border border-stone-paper hover:bg-stone-paper text-charcoal transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={async () => {
              await onConfirm?.();
              onClose();
            }}
            disabled={loading}
            className={`
              px-6 py-2 rounded-lg font-medium text-white transition-all disabled:opacity-50
              ${variant === 'error'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-primary hover:bg-rajkumari'
              }
            `}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      }
    >
      <p className="text-charcoal text-base leading-relaxed">
        {message}
      </p>
    </Modal>
  );
};
