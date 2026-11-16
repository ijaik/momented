"use client";
export interface ConfirmActionOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}
export type ToastType = "success" | "error" | "info";
export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}
type ToastListener = (toast: ToastItem) => void;
type ConfirmListener = (
  options: ConfirmActionOptions,
  resolve: (val: boolean) => void,
) => void;
const toastListeners = new Set<ToastListener>();
let confirmHandler: ConfirmListener | null = null;
export function registerToastListener(listener: ToastListener) {
  toastListeners.add(listener);
  return () => {
    toastListeners.delete(listener);
  };
}
export function registerConfirmHandler(handler: ConfirmListener) {
  confirmHandler = handler;
  return () => {
    if (confirmHandler === handler) confirmHandler = null;
  };
}
export const notifySuccess = (message: string) => {
  const item: ToastItem = {
    id: Math.random().toString(36).slice(2),
    type: "success",
    message,
  };
  toastListeners.forEach((l) => {
    l(item);
  });
  return item.id;
};
export const notifyError = (message: string) => {
  const item: ToastItem = {
    id: Math.random().toString(36).slice(2),
    type: "error",
    message,
  };
  toastListeners.forEach((l) => {
    l(item);
  });
  return item.id;
};
export const notifyLoading = (message: string) => {
  const item: ToastItem = {
    id: Math.random().toString(36).slice(2),
    type: "info",
    message,
  };
  toastListeners.forEach((l) => {
    l(item);
  });
  return item.id;
};
export const toast = {
  success: notifySuccess,
  error: notifyError,
  loading: notifyLoading,
  dismiss: () => {},
};
export function confirmAction(options: ConfirmActionOptions): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    if (confirmHandler) confirmHandler(options, resolve);
    else if (typeof window !== "undefined") {
      const msg = options.message
        ? `${options.title}\n\n${options.message}`
        : options.title;
      resolve(window.confirm(msg));
    } else resolve(false);
  });
}
