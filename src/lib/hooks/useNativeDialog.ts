"use client";
import { type RefObject, useEffect } from "react";
/** Synchronizes a native modal `<dialog>` element with an `isOpen` flag. */
export function useNativeDialog(
  dialogRef: RefObject<HTMLDialogElement | null>,
  isOpen = true,
): void {
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [dialogRef, isOpen]);
}
