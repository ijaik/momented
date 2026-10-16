"use client";
import { useCallback, useEffect, useState } from "react";

interface UseFullscreenMaximizeOptions {
  onMaximize?: () => void;
  onMinimize?: () => void;
}
export function useFullscreenMaximize(options?: UseFullscreenMaximizeOptions) {
  const [isMaximized, setIsMaximized] = useState(false);
  const enterMaximize = useCallback(async () => {
    setIsMaximized(true);
    options?.onMaximize?.();
    try {
      if (
        typeof document !== "undefined" &&
        document.fullscreenEnabled &&
        !document.fullscreenElement
      ) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {}
  }, [options]);
  const exitMaximize = useCallback(async () => {
    setIsMaximized(false);
    options?.onMinimize?.();
    try {
      if (typeof document !== "undefined" && document.fullscreenElement) {
        await document.exitFullscreen().catch(() => {});
      }
    } catch {}
  }, [options]);
  const toggleMaximize = useCallback(async () => {
    if (isMaximized) {
      await exitMaximize();
    } else {
      await enterMaximize();
    }
  }, [isMaximized, enterMaximize, exitMaximize]);
  useEffect(() => {
    const onFullscreenChange = () => {
      if (
        typeof document !== "undefined" &&
        !document.fullscreenElement &&
        isMaximized
      ) {
        setIsMaximized(false);
        options?.onMinimize?.();
      }
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [isMaximized, options]);
  useEffect(() => {
    if (isMaximized) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMaximized]);
  useEffect(() => {
    const onWindowKeyDown = (e: globalThis.KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "Escape" && isMaximized) {
        e.preventDefault();
        exitMaximize();
        return;
      }
      if (
        (e.key === "f" || e.key === "F") &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        e.preventDefault();
        toggleMaximize();
      }
    };
    window.addEventListener("keydown", onWindowKeyDown);
    return () => window.removeEventListener("keydown", onWindowKeyDown);
  }, [isMaximized, exitMaximize, toggleMaximize]);
  return {
    isMaximized,
    setIsMaximized,
    toggleMaximize,
    enterMaximize,
    exitMaximize,
  };
}
