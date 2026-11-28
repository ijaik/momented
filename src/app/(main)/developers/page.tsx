import { ArrowUpRight, Check, Code2, Globe, Shield, Zap } from "lucide-react";
import type { Metadata } from "next";
import JsonLd from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import { developersPageJsonLd, websiteJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import ApiPlayground from "./_components/ApiPlayground";
import CodeBlock from "./_components/CodeBlock";
export const metadata: Metadata = buildPageMetadata({
  title: "Public Wallpaper API & Developer Docs",
  description:
    "Free, public-access REST API to fetch high-resolution CC0 wallpapers and photograph metadata with zero authentication.",
  path: "/developers",
});
export default function DevelopersPage() {
  const isDev = process.env.NODE_ENV === "development";
  const previewUrl =
    process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : null;
  const baseUrl = isDev
    ? "http://localhost:3000"
    : previewUrl || siteConfig.url.replace(/\/$/, "");
  const curlExample = `# 1. Fetch JSON metadata for a random photo
curl "${baseUrl}/api/v1/photos/random"

# 2. Download a high-res mobile (portrait) wallpaper directly
curl -L "${baseUrl}/api/v1/photos/random?orientation=portrait&redirect=true" -o wallpaper.jpg

# 3. Stream uncompressed original camera master directly
curl -L "${baseUrl}/api/v1/photos/random?redirect=true&raw=true" -o master.jpg`;

  const jsExample = `// Fetch a random wallpaper in JavaScript / TypeScript
const res = await fetch("${baseUrl}/api/v1/photos/random");
const { data } = await res.json();

console.log("Title:", data.title);
console.log("Wallpaper URL:", data.image.wallpaper_url);
console.log("Camera:", data.camera.device);
console.log("License:", data.license.name);`;
  const htmlExample = `<!-- Direct dynamic wallpaper image in any web page or markdown -->
<img
  src="${baseUrl}/api/v1/photos/random?redirect=true"
  alt="Momented Photograph"
  width="1920"
  height="1080"
  loading="lazy"
/>`;
  const shellExample = `#!/usr/bin/env bash
# Daily Wallpaper Script (macOS / Linux)
# Downloads a fresh landscape wallpaper and saves to ~/Pictures

WALLPAPER_DIR="$HOME/Pictures/Wallpapers"
mkdir -p "$WALLPAPER_DIR"

curl -sL "${baseUrl}/api/v1/photos/random?orientation=landscape&redirect=true" \\
  -o "$WALLPAPER_DIR/daily-wallpaper.jpg"

echo "New wallpaper downloaded to $WALLPAPER_DIR/daily-wallpaper.jpg"`;
  const sampleJson = `{
  "status": "success",
  "data": {
    "id": "c7a82b94-81d3-4e89-a29d-439589d89163",
    "title": "Evening Horizon",
    "description": "Quiet sunlight breaking through evening clouds.",
    "image": {
      "url": "https://res.cloudinary.com/momented/image/upload/f_auto,c_limit,w_1920,q_auto/v12345/photo.jpg",
      "wallpaper_url": "https://res.cloudinary.com/momented/image/upload/f_auto,c_limit,w_1920,q_auto/v12345/photo.jpg",
      "thumbnail_url": "https://res.cloudinary.com/momented/image/upload/f_auto,c_limit,w_640,q_auto/v12345/photo.jpg",
      "raw_url": "https://res.cloudinary.com/momented/image/upload/v12345/photo.jpg",
      "fallback_url": "${baseUrl}/fallback-photos/fallback-landscape.jpg",
      "width": 4032,
      "height": 3024,
      "aspect_ratio": "4032:3024"
    },
    "observer": {
      "name": "${siteConfig.author.name}",
      "role": "${siteConfig.author.role}",
      "url": "${baseUrl}/about"
    },
    "camera": {
      "device": "moto g64 5G",
      "focal_length": "4.2mm",
      "aperture": "f/1.8",
      "shutter_speed": "1/250s",
      "iso": 100,
      "taken_at": "2026-05-14T18:30:00Z"
    },
    "license": {
      "name": "Creative Commons Zero 1.0 Universal (CC0)",
      "url": "https://creativecommons.org/publicdomain/zero/1.0/",
      "commercial_use_allowed": true,
      "attribution_required": false
    },
    "links": {
      "html": "${baseUrl}/photo/c7a82b94-81d3-4e89-a29d-439589d89163",
      "download": "${baseUrl}/api/v1/photos/random?download=true",
      "direct_image": "${baseUrl}/api/v1/photos/random?redirect=true"
    }
  }
}`;
  return (
    <>
      <JsonLd data={[developersPageJsonLd(), websiteJsonLd()]} />
      <div className="py-8 sm:py-12 md:py-14">
        {/* Header */}
        <header className="border-b border-line/70 pb-12 sm:pb-16">
          <div className="mb-4 sm:mb-5 flex items-center gap-3">
            <span className="h-px w-6 bg-ink/70" aria-hidden="true" />
            <span className="editorial-label text-ink font-medium">
              Public API &amp; Integrations
            </span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.03] tracking-tight text-ink font-normal">
            Built for builders.
          </h1>
          <p className="mt-6 sm:mt-8 max-w-2xl font-sans text-lg sm:text-xl leading-relaxed text-muted font-normal">
            A free, open-access REST API to retrieve high-resolution CC0
            photographs, camera metadata, and dynamic wallpapers without API
            keys.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 text-xs font-mono text-muted">
            <div className="flex items-center gap-1.5 rounded-full border border-line/70 bg-surface/50 px-3.5 py-1.5">
              <Shield size={13} className="text-ink" aria-hidden="true" />
              <span>No API Keys Required</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-line/70 bg-surface/50 px-3.5 py-1.5">
              <Shield size={13} className="text-ink" aria-hidden="true" />
              <span>60 Reqs / Hour / IP</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-line/70 bg-surface/50 px-3.5 py-1.5">
              <Zap size={13} className="text-ink" aria-hidden="true" />
              <span>Vercel Edge CDN (~10ms)</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-line/70 bg-surface/50 px-3.5 py-1.5">
              <Globe size={13} className="text-ink" aria-hidden="true" />
              <span>CORS Enabled (Origin: *)</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-line/70 bg-surface/50 px-3.5 py-1.5">
              <Code2 size={13} className="text-ink" aria-hidden="true" />
              <span>CC0 Public Domain</span>
            </div>
          </div>
        </header>
        {/* Asymmetric 12-Column Monograph */}
        <div className="divide-y divide-line/70">
          {/* Section 01: Overview */}
          <section className="grid grid-cols-1 gap-8 py-12 md:grid-cols-12 md:gap-12 md:py-16">
            <div className="md:col-span-4">
              <span className="editorial-label text-ink font-medium">
                01 / Philosophy
              </span>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl tracking-tight text-ink font-normal">
                Frictionless and open.
              </h2>
            </div>
            <div className="md:col-span-8 flex flex-col gap-6 text-[15px] sm:text-base leading-relaxed text-muted">
              <p>
                Every photograph in Momented is freely dedicated to the public
                domain under Creative Commons CC0 1.0 Universal. This API lets
                developers, designers, and hobbyists integrate authentic,
                human-observed photography into their own creations—whether for
                personal desktop wallpaper changers, mobile apps, Raycast
                extensions, or web hero mockups.
              </p>
              <p>
                There are no signup forms, tokens, or usage meters. Requests are
                served with edge cache headers (
                <code className="rounded bg-soft px-1.5 py-0.5 font-mono text-xs text-ink">
                  s-maxage=60
                </code>
                ), delivering responses from edge nodes worldwide with minimal
                latency.
              </p>
            </div>
          </section>
          {/* Section 02: Endpoints & Parameters */}
          <section className="grid grid-cols-1 gap-8 py-12 md:grid-cols-12 md:gap-12 md:py-16">
            <div className="md:col-span-4">
              <span className="editorial-label text-ink font-medium">
                02 / Reference
              </span>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl tracking-tight text-ink font-normal">
                Random Photo Endpoint.
              </h2>
            </div>
            <div className="md:col-span-8 flex flex-col gap-6">
              <div className="flex items-center gap-3 font-mono text-sm">
                <span className="rounded bg-ink px-2.5 py-1 text-xs font-semibold uppercase text-paper">
                  GET
                </span>
                <span className="font-semibold text-ink">
                  /api/v1/photos/random
                </span>
              </div>
              <p className="text-[15px] sm:text-base leading-relaxed text-muted">
                Returns a randomly selected photograph from the published
                archive along with full camera metadata, Cloudinary image
                variants, immutable static fallbacks, and direct download links.
              </p>
              {/* Parameters Table */}
              <div className="overflow-x-auto rounded-lg border border-line/70">
                <table className="w-full text-left font-mono text-xs">
                  <caption id="parameters-table-caption" className="sr-only">
                    Endpoint Query Parameters
                  </caption>
                  <thead className="border-b border-line/60 bg-paper/60 uppercase tracking-wider text-muted">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Parameter</th>
                      <th className="px-4 py-3 font-semibold">Type</th>
                      <th className="px-4 py-3 font-semibold">Default</th>
                      <th className="px-4 py-3 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/40 text-ink/80">
                    <tr>
                      <td className="px-4 py-3 text-ink font-semibold">
                        orientation
                      </td>
                      <td className="px-4 py-3 text-muted">string</td>
                      <td className="px-4 py-3 text-muted">all</td>
                      <td className="px-4 py-3 font-sans text-xs text-muted">
                        Filter by aspect ratio:{" "}
                        <code className="text-ink font-mono font-medium">
                          portrait
                        </code>{" "}
                        (phones) or{" "}
                        <code className="text-ink font-mono font-medium">
                          landscape
                        </code>{" "}
                        (desktops).
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-ink font-semibold">
                        redirect
                      </td>
                      <td className="px-4 py-3 text-muted">boolean</td>
                      <td className="px-4 py-3 text-muted">false</td>
                      <td className="px-4 py-3 font-sans text-xs text-muted">
                        When{" "}
                        <code className="text-ink font-mono font-medium">
                          true
                        </code>{" "}
                        or{" "}
                        <code className="text-ink font-mono font-medium">
                          1
                        </code>
                        , returns an HTTP 302 redirect directly to the fast
                        1920px Full HD wallpaper stream.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-ink font-semibold">raw</td>
                      <td className="px-4 py-3 text-muted">boolean</td>
                      <td className="px-4 py-3 text-muted">false</td>
                      <td className="px-4 py-3 font-sans text-xs text-muted">
                        When{" "}
                        <code className="text-ink font-mono font-medium">
                          true
                        </code>{" "}
                        paired with{" "}
                        <code className="text-ink font-mono font-medium">
                          redirect=true
                        </code>
                        , redirects to the uncompressed original camera file
                        rather than the optimized 1920px stream.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-ink font-semibold">
                        download
                      </td>
                      <td className="px-4 py-3 text-muted">boolean</td>
                      <td className="px-4 py-3 text-muted">false</td>
                      <td className="px-4 py-3 font-sans text-xs text-muted">
                        When{" "}
                        <code className="text-ink font-mono font-medium">
                          true
                        </code>
                        , returns an HTTP 302 redirect with attachment headers
                        to trigger a native file download.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
          {/* Section 03: Rate Limits & Headers */}
          <section className="grid grid-cols-1 gap-8 py-12 md:grid-cols-12 md:gap-12 md:py-16">
            <div className="md:col-span-4">
              <span className="editorial-label text-ink font-medium">
                03 / Quotas
              </span>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl tracking-tight text-ink font-normal">
                Rate Limits &amp; Headers.
              </h2>
            </div>
            <div className="md:col-span-8 flex flex-col gap-6">
              <p className="text-[15px] sm:text-base leading-relaxed text-muted">
                To keep this API 100% free and protect service availability
                without requiring API keys or registration, public access is
                limited to{" "}
                <strong className="text-ink font-medium">
                  60 requests per hour per IP address
                </strong>{" "}
                (sliding window). This comfortably supports personal scripts,
                desktop rotators, Raycast commands, and web widgets.
              </p>
              {/* Rate Limit Headers Table */}
              <div className="overflow-x-auto rounded-lg border border-line/70">
                <table className="w-full text-left font-mono text-xs">
                  <caption id="ratelimit-headers-caption" className="sr-only">
                    HTTP Rate Limit Headers Reference
                  </caption>
                  <thead className="border-b border-line/60 bg-paper/60 uppercase tracking-wider text-muted">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Header</th>
                      <th className="px-4 py-3 font-semibold">Type</th>
                      <th className="px-4 py-3 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/40 text-ink/80">
                    <tr>
                      <td className="px-4 py-3 text-ink font-semibold">
                        X-RateLimit-Limit
                      </td>
                      <td className="px-4 py-3 text-muted">integer</td>
                      <td className="px-4 py-3 font-sans text-xs text-muted">
                        Maximum requests permitted within the 1-hour window
                        (currently{" "}
                        <code className="text-ink font-mono font-medium">
                          60
                        </code>
                        ).
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-ink font-semibold">
                        X-RateLimit-Remaining
                      </td>
                      <td className="px-4 py-3 text-muted">integer</td>
                      <td className="px-4 py-3 font-sans text-xs text-muted">
                        Number of remaining requests available to your IP
                        address in the current 1-hour window.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-ink font-semibold">
                        X-RateLimit-Reset
                      </td>
                      <td className="px-4 py-3 text-muted">timestamp</td>
                      <td className="px-4 py-3 font-sans text-xs text-muted">
                        Unix timestamp (in seconds) when the rate limit window
                        resets.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-ink font-semibold">
                        Retry-After
                      </td>
                      <td className="px-4 py-3 text-muted">integer</td>
                      <td className="px-4 py-3 font-sans text-xs text-muted">
                        Returned on{" "}
                        <code className="text-ink font-mono font-medium">
                          HTTP 429 Too Many Requests
                        </code>{" "}
                        indicating the number of seconds until requests are
                        permitted again.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {/* 429 Error Example */}
              <div className="rounded-lg border border-line/60 bg-paper/50 p-4 text-xs font-mono text-muted">
                <span className="font-semibold text-ink uppercase text-[11px] block mb-2">
                  Exceeded Quota Response (HTTP 429)
                </span>
                <pre className="text-ink/85 overflow-x-auto leading-relaxed">
                  {`{
  "status": "error",
  "message": "Rate limit exceeded. Public API is limited to 60 requests per hour per IP.",
  "retry_after_seconds": 3540
}`}
                </pre>
              </div>
              {/* Edge CDN Caching Note */}
              <div className="rounded-lg border border-line/60 bg-paper/30 p-4 text-xs font-mono text-muted">
                <span className="font-semibold text-ink uppercase text-[11px] block mb-1.5">
                  Edge CDN Caching &amp; Quota Consumption
                </span>
                <p className="font-sans text-xs leading-relaxed text-muted">
                  Responses are cached globally at Vercel&apos;s edge network
                  for 60 seconds (
                  <code className="text-ink font-mono font-medium">
                    s-maxage=60
                  </code>
                  ). Cache hits are served near-instantaneously (~10ms) and
                  reflect the rate-limit header snapshot of the initial cache
                  fill without decrementing your IP address&apos;s hourly quota.
                </p>
              </div>
            </div>
          </section>
          {/* Section 04: Live Playground */}
          <section className="grid grid-cols-1 gap-8 py-12 md:grid-cols-12 md:gap-12 md:py-16">
            <div className="md:col-span-4">
              <span className="editorial-label text-ink font-medium">
                04 / Test It
              </span>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl tracking-tight text-ink font-normal">
                Live Playground.
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-muted leading-relaxed">
                Send real requests to the live production endpoint and inspect
                the returned JSON and visual asset.
              </p>
            </div>
            <div className="md:col-span-8">
              <ApiPlayground baseUrl={baseUrl} />
            </div>
          </section>
          {/* Section 05: Integration Examples */}
          <section className="grid grid-cols-1 gap-8 py-12 md:grid-cols-12 md:gap-12 md:py-16">
            <div className="md:col-span-4">
              <span className="editorial-label text-ink font-medium">
                05 / Code Examples
              </span>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl tracking-tight text-ink font-normal">
                Quick Integration.
              </h2>
            </div>
            <div className="md:col-span-8 flex flex-col gap-6">
              <div>
                <h3 className="font-serif text-lg text-ink font-normal mb-2">
                  cURL &amp; Terminal
                </h3>
                <CodeBlock
                  code={curlExample}
                  language="bash"
                  label="cURL command"
                />
              </div>
              <div>
                <h3 className="font-serif text-lg text-ink font-normal mb-2">
                  JavaScript &amp; TypeScript (Fetch)
                </h3>
                <CodeBlock
                  code={jsExample}
                  language="typescript"
                  label="TypeScript code"
                />
              </div>
              <div>
                <h3 className="font-serif text-lg text-ink font-normal mb-2">
                  HTML Direct Image Embed
                </h3>
                <CodeBlock
                  code={htmlExample}
                  language="html"
                  label="HTML snippet"
                />
              </div>
              <div>
                <h3 className="font-serif text-lg text-ink font-normal mb-2">
                  Daily Desktop Wallpaper Script (macOS / Linux)
                </h3>
                <CodeBlock
                  code={shellExample}
                  language="bash"
                  label="Shell script"
                />
              </div>
            </div>
          </section>
          {/* Section 06: Response Schema */}
          <section className="grid grid-cols-1 gap-8 py-12 md:grid-cols-12 md:gap-12 md:py-16">
            <div className="md:col-span-4">
              <span className="editorial-label text-ink font-medium">
                06 / Schema
              </span>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl tracking-tight text-ink font-normal">
                JSON Response.
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-muted leading-relaxed">
                Standardized structure providing Cloudinary optimized URLs,
                camera EXIF, observer credentials, immutable edge fallback URLs,
                and public domain licenses.
              </p>
            </div>
            <div className="md:col-span-8">
              <CodeBlock
                code={sampleJson}
                language="json"
                label="Sample JSON response"
              />
            </div>
          </section>
          {/* Section 07: License and Terms */}
          <section className="grid grid-cols-1 gap-8 py-12 md:grid-cols-12 md:gap-12 md:py-16">
            <div className="md:col-span-4">
              <span className="editorial-label text-ink font-medium">
                07 / License
              </span>
              <h2 className="mt-2 font-serif text-2xl sm:text-3xl tracking-tight text-ink font-normal">
                Usage Rights.
              </h2>
            </div>
            <div className="md:col-span-8 flex flex-col gap-5 text-[15px] sm:text-base leading-relaxed text-muted">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-muted">
                <li className="flex items-center gap-2">
                  <Check
                    size={14}
                    className="text-ink shrink-0"
                    aria-hidden="true"
                  />
                  Free for personal and commercial projects
                </li>
                <li className="flex items-center gap-2">
                  <Check
                    size={14}
                    className="text-ink shrink-0"
                    aria-hidden="true"
                  />
                  No API key or registration required
                </li>
                <li className="flex items-center gap-2">
                  <Check
                    size={14}
                    className="text-ink shrink-0"
                    aria-hidden="true"
                  />
                  Attribution appreciated, never required
                </li>
                <li className="flex items-center gap-2">
                  <Check
                    size={14}
                    className="text-ink shrink-0"
                    aria-hidden="true"
                  />
                  Creative Commons Zero 1.0 Universal
                </li>
              </ul>
              <div>
                <a
                  href="https://creativecommons.org/publicdomain/zero/1.0/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-ink underline underline-offset-4 hover:opacity-80 transition-opacity"
                >
                  <span>Learn about CC0 Public Domain</span>
                  <ArrowUpRight size={12} aria-hidden="true" />
                </a>
              </div>
            </div>
          </section>
        </div>
        {/* Colophon */}
        <div className="mt-16 sm:mt-20 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 border-t border-line/70 pt-8">
          <p className="font-serif text-base text-muted">
            Momented for creators and builders.
          </p>
          <a
            href={siteConfig.author.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted hover:text-ink transition-colors"
          >
            <span>Jai on GitHub</span>
            <ArrowUpRight size={12} aria-hidden="true" />
          </a>
        </div>
      </div>
    </>
  );
}
