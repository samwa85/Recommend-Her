// ============================================================================
// TOAST NOTIFICATION HOOK
// Wrapper around sonner for consistent notifications
// ============================================================================

import { toast as sonnerToast } from 'sonner';

export interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useToast = () => {
  const success = (message: string, options?: ToastOptions) => {
    sonnerToast.success(message, {
      description: options?.description,
      duration: options?.duration || 4000,
      action: options?.action,
    });
  };

  const error = (message: string, options?: ToastOptions) => {
    sonnerToast.error(message, {
      description: options?.description,
      duration: options?.duration || 6000,
      action: options?.action,
    });
  };

  const warning = (message: string, options?: ToastOptions) => {
    sonnerToast.warning(message, {
      description: options?.description,
      duration: options?.duration || 5000,
    });
  };

  const info = (message: string, options?: ToastOptions) => {
    sonnerToast.info(message, {
      description: options?.description,
      duration: options?.duration || 4000,
    });
  };

  const loading = (message: string, options?: { description?: string }) => {
    return sonnerToast.loading(message, {
      description: options?.description,
    });
  };

  const dismiss = (toastId?: string | number) => {
    if (toastId) {
      sonnerToast.dismiss(toastId);
    } else {
      sonnerToast.dismiss();
    }
  };

  const promise = <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  };

  return {
    success,
    error,
    warning,
    info,
    loading,
    dismiss,
    promise,
  };
};

export default useToast;
