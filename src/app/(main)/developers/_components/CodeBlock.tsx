"use client";
import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { copyText } from "@/lib/utils/share";

interface CodeBlockProps {
  code: string;
  language?: string;
  label?: string;
  className?: string;
}
export default function CodeBlock({
  code,
  language = "bash",
  label = "code snippet",
  className = "",
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);
  const handleCopy = async () => {
    try {
      await copyText(code);
      setCopied(true);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.warn("Failed to copy code snippet:", err);
    }
  };
  return (
    <div
      className={`group relative overflow-hidden rounded-lg border border-line/70 bg-surface/50 font-mono text-xs sm:text-sm ${className}`}
    >
      <div className="flex items-center justify-between border-b border-line/60 bg-paper/40 px-3.5 py-2 text-[11px] font-mono uppercase tracking-wider text-muted">
        <span>{language}</span>
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-mono text-ink transition-opacity duration-150"
            role="status"
            aria-live="polite"
          >
            {copied ? "Copied" : ""}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            aria-label={`Copy ${label}`}
            className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm text-muted transition-colors hover:bg-soft hover:text-ink focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ink"
          >
            {copied ? (
              <Check size={13} className="text-ink" aria-hidden="true" />
            ) : (
              <Copy size={13} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed text-ink/90">
        <code>{code}</code>
      </pre>
    </div>
  );
}
