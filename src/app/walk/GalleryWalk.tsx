"use client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Photo } from "@/types";
import {
  createWalkSceneController,
  type WalkSceneController,
} from "./walkScene";

function subscribeColorScheme(cb: () => void) {
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  mql.addEventListener("change", cb);
  return () => mql.removeEventListener("change", cb);
}
function getColorSchemeSnapshot(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
function getServerColorSchemeSnapshot(): boolean {
  return false;
}
export default function GalleryWalk({ photos }: { photos: Photo[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<WalkSceneController | null>(null);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [webGlError, setWebGlError] = useState<string | null>(null);
  const isDarkMode = useSyncExternalStore(
    subscribeColorScheme,
    getColorSchemeSnapshot,
    getServerColorSchemeSnapshot,
  );
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const controller = createWalkSceneController(canvas, photos, {
      onAtEndChange: setIsAtEnd,
      onContextError: setWebGlError,
    });
    controllerRef.current = controller;
    return () => {
      controller?.dispose();
      controllerRef.current = null;
    };
  }, [photos]);
  useEffect(() => {
    controllerRef.current?.setDarkMode(isDarkMode);
  }, [isDarkMode]);
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) =>
      controllerRef.current?.handleKeyDown(e);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  return (
    <div
      onWheel={(e) => controllerRef.current?.handleWheel(e)}
      onPointerDown={(e) =>
        controllerRef.current?.handlePointerDown({
          target: e.target,
          clientX: e.clientX,
          clientY: e.clientY,
          pointerId: e.pointerId,
          captureTarget: e.currentTarget,
        })
      }
      onPointerMove={(e) =>
        controllerRef.current?.handlePointerMove({
          clientX: e.clientX,
          clientY: e.clientY,
        })
      }
      onPointerUp={(e) =>
        controllerRef.current?.handlePointerUp({
          clientX: e.clientX,
          clientY: e.clientY,
          pointerId: e.pointerId,
          captureTarget: e.currentTarget,
        })
      }
      onPointerCancel={(e) =>
        controllerRef.current?.handlePointerCancel({
          pointerId: e.pointerId,
          captureTarget: e.currentTarget,
        })
      }
      className="fixed inset-0 w-dvw h-dvh overflow-hidden select-none font-sans bg-paper text-ink touch-none"
    >
      <h1 className="sr-only">Gallery Walk — Momented</h1>
      <Link
        href="/"
        className="fixed top-5 left-5 z-20 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface/90 backdrop-blur-md border border-line text-xs font-mono uppercase tracking-widest text-muted hover:text-ink transition-colors shadow-xs"
        title="Exit to Momented Home"
      >
        <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Exit</span>
      </Link>
      <main
        id="gallery"
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
      >
        <canvas
          ref={canvasRef}
          aria-label="Interactive 3D photography gallery corridor"
          className="w-full h-full block"
        >
          Interactive 3D gallery corridor is unavailable without WebGL.
        </canvas>
      </main>
      <nav aria-label="Photographs in this corridor" className="sr-only">
        <ul>
          {photos.map((p, index) => (
            <li key={p.id}>
              <Link href={`/photo/${p.id}`}>
                {p.title || `Frame ${index + 1}`}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {webGlError && (
        <div
          role="alert"
          className="fixed inset-0 z-30 flex items-center justify-center bg-paper/95 p-6 text-center"
        >
          <div className="max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-md">
            <h2 className="font-serif text-2xl tracking-tight text-ink">
              3D view unavailable
            </h2>
            <p className="mt-2 text-sm text-muted">{webGlError}</p>
            <div className="mt-5 flex justify-center gap-3">
              <Link
                href="/photos"
                className="rounded-full bg-solid px-4 py-2 font-mono text-xs uppercase tracking-wider text-on-solid hover:opacity-90"
              >
                Browse Grid
              </Link>
            </div>
          </div>
        </div>
      )}
      {isAtEnd && !webGlError && (
        <aside
          aria-label="Exhibition complete"
          className="fixed bottom-8 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-20 rounded-2xl border border-line bg-surface/92 p-6 text-center shadow-xl backdrop-blur-md"
        >
          <h2 className="font-serif text-2xl sm:text-3xl tracking-tight text-ink">
            Thank you for walking through these moments.
          </h2>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => controllerRef.current?.returnToStart()}
              className="rounded-full border border-line bg-transparent px-4 py-2 font-mono text-xs uppercase tracking-wider text-ink transition-colors hover:bg-soft cursor-pointer"
            >
              Return to Start
            </button>
            <Link
              href="/photos"
              className="rounded-full bg-solid text-on-solid px-4 py-2 font-mono text-xs uppercase tracking-wider transition-opacity hover:opacity-90"
            >
              Browse Grid
            </Link>
          </div>
        </aside>
      )}
    </div>
  );
}
