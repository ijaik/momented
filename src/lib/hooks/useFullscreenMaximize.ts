"use client";
import { useEffect, useEffectEvent, useState } from "react";
export function useFullscreenMaximize() {
  const [isMaximized, setIsMaximized] = useState(false);
  const enterMaximize = async () => {
    setIsMaximized(true);
    try {
      if (
        typeof document !== "undefined" &&
        document.fullscreenEnabled &&
        !document.fullscreenElement
      )
        await document.documentElement.requestFullscreen().catch(() => {});
    } catch {}
  };
  const exitMaximize = async () => {
    setIsMaximized(false);
    try {
      if (typeof document !== "undefined" && document.fullscreenElement)
        await document.exitFullscreen().catch(() => {});
    } catch {}
  };
  const toggleMaximize = async () => {
    if (isMaximized) await exitMaximize();
    else await enterMaximize();
  };
  const onFullscreenChange = useEffectEvent(() => {
    if (
      typeof document !== "undefined" &&
      !document.fullscreenElement &&
      isMaximized
    )
      setIsMaximized(false);
  });
  const onWindowKeyDown = useEffectEvent((e: globalThis.KeyboardEvent) => {
    const target = e.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable)
    )
      return;
    if (e.key === "Escape" && isMaximized) {
      e.preventDefault();
      void exitMaximize();
      return;
    }
    if (
      (e.key === "f" || e.key === "F") &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.altKey
    ) {
      e.preventDefault();
      void toggleMaximize();
    }
  });
  useEffect(() => {
    document.addEventListener("fullscreenchange", onFullscreenChange);
    window.addEventListener("keydown", onWindowKeyDown);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      window.removeEventListener("keydown", onWindowKeyDown);
    };
  }, []);
  useEffect(() => {
    if (isMaximized) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMaximized]);
  return {
    isMaximized,
    toggleMaximize,
    exitMaximize,
  };
}
