"use client";
import {
  ArrowUpRight,
  Check,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  Play,
} from "lucide-react";
import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import { copyText } from "@/lib/utils/share";

const emptySubscribe = () => () => {};
function getClientOrigin(): string {
  return typeof window !== "undefined" ? window.location.origin : "";
}
type ApiMode = "json" | "redirect" | "raw" | "download";
export default function ApiPlayground({ baseUrl }: { baseUrl: string }) {
  const clientOrigin = useSyncExternalStore(
    emptySubscribe,
    getClientOrigin,
    () => baseUrl,
  );
  const origin = clientOrigin || baseUrl;
  const [orientation, setOrientation] = useState<string>("all");
  const [mode, setMode] = useState<ApiMode>("json");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    remaining: string | null;
    limit: string | null;
  } | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Build query string cleanly using URLSearchParams
  const params = new URLSearchParams();
  if (orientation !== "all") params.set("orientation", orientation);
  if (mode === "redirect") params.set("redirect", "true");
  else if (mode === "raw") {
    params.set("redirect", "true");
    params.set("raw", "true");
  } else if (mode === "download") params.set("download", "true");
  const queryString = params.toString() ? `?${params.toString()}` : "";
  const endpointPath = `/api/v1/photos/random${queryString}`;
  const fullUrl = `${origin}${endpointPath}`;
  const handleAction = async () => {
    if (mode === "json") {
      setLoading(true);
      setError(null);
      const start = performance.now();
      try {
        const res = await fetch(endpointPath, {
          headers: { Accept: "application/json" },
        });
        const remaining = res.headers.get("x-ratelimit-remaining");
        const limit = res.headers.get("x-ratelimit-limit");
        if (remaining !== null) setRateLimitInfo({ remaining, limit });
        const data = await res.json();
        setResponseTime(Math.round(performance.now() - start));
        if (!res.ok) {
          setError(
            res.status === 429
              ? `${data?.message || "Rate limit exceeded."} (Retry after ${data?.retry_after_seconds || 60}s)`
              : data?.message || "Failed to fetch photo",
          );
          setResult(null);
        } else setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error");
        setResult(null);
      } finally {
        setLoading(false);
      }
    } else window.open(fullUrl, "_blank"); // For redirect or download modes, open target URL directly
  };
  const handleCopyJson = async () => {
    if (!result) return;
    try {
      await copyText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("Failed to copy JSON:", err);
    }
  };
  const photoData = (result?.data as Record<string, unknown>) || null;
  const imageData = (photoData?.image as Record<string, unknown>) || null;
  const thumbnailUrl = (imageData?.thumbnail_url as string) || null;
  const title = (photoData?.title as string) || "Random Photograph";
  return (
    <div className="rounded-xl border border-line/70 bg-surface/30 p-5 sm:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-6 border-b border-line/60">
        <div>
          <h3 className="font-serif text-xl sm:text-2xl text-ink font-normal">
            Live API Playground
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            Test all parameters live against the Edge CDN endpoint directly in
            your browser.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Orientation Filter */}
          <label className="sr-only" htmlFor="orientation-select">
            Filter by orientation
          </label>
          <select
            id="orientation-select"
            value={orientation}
            onChange={(e) => setOrientation(e.target.value)}
            className="h-9 cursor-pointer rounded-md border border-line bg-paper px-3 text-xs font-mono text-ink focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ink"
          >
            <option value="all">Orientation: All</option>
            <option value="portrait">Orientation: Portrait (Phone)</option>
            <option value="landscape">Orientation: Landscape (Desktop)</option>
          </select>
          {/* Mode / Parameter Filter */}
          <label className="sr-only" htmlFor="mode-select">
            Select response mode
          </label>
          <select
            id="mode-select"
            value={mode}
            onChange={(e) => setMode(e.target.value as ApiMode)}
            className="h-9 cursor-pointer rounded-md border border-line bg-paper px-3 text-xs font-mono text-ink focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ink"
          >
            <option value="json">Response: JSON Metadata</option>
            <option value="redirect">
              Action: Redirect to Wallpaper (?redirect=true)
            </option>
            <option value="raw">
              Action: Redirect to Raw Master (&amp;raw=true)
            </option>
            <option value="download">
              Action: Download Attachment (?download=true)
            </option>
          </select>
          {/* Action Button */}
          <button
            type="button"
            onClick={handleAction}
            disabled={loading}
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-ink px-4 text-xs font-mono uppercase tracking-wider text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={13} className="animate-spin" aria-hidden="true" />
            ) : mode === "download" ? (
              <Download size={13} aria-hidden="true" />
            ) : mode === "redirect" || mode === "raw" ? (
              <ExternalLink size={13} aria-hidden="true" />
            ) : (
              <Play size={12} className="fill-paper" aria-hidden="true" />
            )}
            <span>
              {mode === "json"
                ? "Send Request"
                : mode === "download"
                  ? "Test Download"
                  : "Open Stream"}
            </span>
          </button>
        </div>
      </div>
      {/* Target URL Preview */}
      <div className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-line/50 bg-paper/60 px-3.5 py-2.5 font-mono text-xs">
        <div className="flex items-center gap-2 overflow-x-auto text-muted">
          <span className="font-semibold text-ink uppercase text-[11px]">
            GET
          </span>
          <span className="truncate text-ink/80">{fullUrl}</span>
        </div>
        <a
          href={fullUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-muted hover:text-ink transition-colors"
        >
          <span>Open</span>
          <ArrowUpRight size={11} aria-hidden="true" />
        </a>
      </div>
      {/* Mode Guidance Note */}
      {mode !== "json" && (
        <div className="mt-4 rounded-lg border border-line/60 bg-paper/40 p-4 text-xs font-mono text-muted">
          {mode === "redirect" && (
            <p>
              <strong className="text-ink">Redirect Mode:</strong> Returns an
              HTTP 302 redirect directly to the fast, Full HD (1920px) optimized
              WebP/AVIF Cloudinary stream. Ideal for wallpaper changer scripts,
              Raycast, and HTML &lt;img&gt; tags.
            </p>
          )}
          {mode === "raw" && (
            <p>
              <strong className="text-ink">Raw Master Mode:</strong> Returns an
              HTTP 302 redirect to the uncompressed original camera file.
              Provides maximum master fidelity for print or archiving.
            </p>
          )}
          {mode === "download" && (
            <p>
              <strong className="text-ink">Download Mode:</strong> Returns an
              HTTP 302 redirect with attachment headers so the client
              automatically triggers a &ldquo;Save As&rdquo; file download with
              a clean slugified filename.
            </p>
          )}
        </div>
      )}
      {/* Results View for JSON mode */}
      {mode === "json" && result && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {thumbnailUrl && (
            <div className="lg:col-span-4 flex flex-col gap-3">
              <span className="editorial-label text-ink font-medium">
                Live Result
              </span>
              <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-line/60 bg-soft">
                <Image
                  src={thumbnailUrl}
                  alt={title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 300px"
                  className="object-cover"
                />
              </div>
              <div className="text-xs font-mono text-muted flex items-center justify-between gap-2">
                <span className="truncate font-medium text-ink">{title}</span>
                <div className="flex items-center gap-2.5 shrink-0 text-[11px]">
                  {rateLimitInfo?.remaining !== null && (
                    <span className="text-muted">
                      {rateLimitInfo?.remaining}/{rateLimitInfo?.limit || "60"}{" "}
                      left
                    </span>
                  )}
                  {responseTime && (
                    <span className="text-faint">{responseTime}ms</span>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className={thumbnailUrl ? "lg:col-span-8" : "lg:col-span-12"}>
            <div className="flex items-center justify-between pb-2">
              <span className="editorial-label text-ink font-medium">
                JSON Response
              </span>
              <div className="flex items-center gap-2">
                <span
                  className="text-[11px] font-mono text-ink"
                  role="status"
                  aria-live="polite"
                >
                  {copied ? "Copied" : ""}
                </span>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  aria-label="Copy API response JSON"
                  className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm text-muted transition-colors hover:bg-soft hover:text-ink focus-visible:ring-1 focus-visible:ring-ink"
                >
                  {copied ? (
                    <Check size={13} className="text-ink" aria-hidden="true" />
                  ) : (
                    <Copy size={13} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
            <pre className="max-h-80 overflow-y-auto rounded-lg border border-line/70 bg-paper/80 p-4 font-mono text-xs leading-relaxed text-ink/90">
              <code>{JSON.stringify(result, null, 2)}</code>
            </pre>
          </div>
        </div>
      )}
      {error && (
        <div className="mt-5 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-xs font-mono text-red-600 dark:text-red-400">
          Error: {error}
        </div>
      )}
      {mode === "json" && !result && !error && !loading && (
        <div className="mt-6 flex flex-col items-center justify-center py-8 text-center text-muted">
          <p className="text-xs font-mono">
            Click &ldquo;Send Request&rdquo; to test the endpoint live and
            preview the returned wallpaper.
          </p>
        </div>
      )}
    </div>
  );
}
