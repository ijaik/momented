"use client";
import { useEffect, useRef, useState } from "react";
import { copyText } from "@/lib/utils/share";
/** Copies text to the clipboard and exposes a timed `copied` state with unmount cleanup. */
export function useCopyToClipboard(resetMs = 2000) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
  const reset = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setCopied(false);
  };
  const copy = async (text: string): Promise<boolean> => {
    try {
      await copyText(text);
      if (timerRef.current) clearTimeout(timerRef.current);
      setCopied(true);
      timerRef.current = setTimeout(() => {
        setCopied(false);
        timerRef.current = null;
      }, resetMs);
      return true;
    } catch {
      return false;
    }
  };
  return { copied, copy, reset };
}
