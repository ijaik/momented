"use client";
import { Toaster } from "react-hot-toast";
export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        className:
          "!bg-surface !border !border-line !text-ink !shadow-lg !rounded-xl !text-xs !font-sans !py-2.5 !px-4",
        success: {
          iconTheme: {
            primary: "var(--color-ink)",
            secondary: "var(--color-paper)",
          },
        },
        error: {
          iconTheme: {
            primary: "var(--color-danger)",
            secondary: "var(--color-paper)",
          },
        },
      }}
    />
  );
}
