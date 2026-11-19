<div align="center">
  <br />
  <h1>
    <img src="/public/icons/icon.svg" height="36" width="36" alt="Momented Logo" />
    Momented
  </h1>
  <p>
    <b>An editorial photography journal documenting light, shadows, and everyday moments.</b>
  </p>
  <p>
    <a href="https://momented.vercel.app"><strong>Explore Live Site →</strong></a>
  </p>
  <p>
    <a href="https://github.com/ijaik/momented/blob/main/LICENSE"><img src="https://img.shields.io/badge/Code_License-MIT-blue.svg?style=flat-square" alt="MIT License" /></a>
    <a href="https://creativecommons.org/publicdomain/zero/1.0/"><img src="https://img.shields.io/badge/Content_License-CC0_1.0-purple.svg?style=flat-square" alt="CC0 1.0 License" /></a>
    <img src="https://img.shields.io/badge/Next.js-16_(App_Router)-black?style=flat-square&logo=next.js" alt="Next.js 16" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS v4" />
    <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase" alt="Supabase" />
    <img src="https://img.shields.io/badge/Runtime-Bun-fbf0df?style=flat-square&logo=bun&logoColor=black" alt="Bun" />
  </p>
</div>

<br />

---

## 📑 Table of Contents

- [✨ Features](#-features)
- [🌐 Public Wallpaper API](#-public-wallpaper-api)
- [🛠️ Tech Stack](#️-tech-stack)
- [📸 Screenshots](#-screenshots)
- [🚀 Getting Started](#-getting-started)
- [⚙️ Environment Variables](#️-environment-variables)
- [🧪 Quality Checks & Testing](#-quality-checks--testing)
- [📁 Project Structure](#-project-structure)
- [📄 License](#-license)

---

## ✨ Features

### 🖼️ Curatorial Editorial Presentation

- **Responsive Masonry Grid** — Fluid, multi-column gallery designed for visual breathing room and fast browsing.
- **Thematic Collections & Rules** — Group photographs by mood, aesthetic constraints (e.g. _Rule of Thirds_, _Leading Lines_), and automatic calendar month backfilling.
- **Photographic Series** — Multi-slide visual essays with custom slide ordering and story captions.
- **Camera EXIF Telemetry** — Automatic extraction and formatting of technical camera metadata (Focal Length, Aperture, Shutter Speed, ISO, Camera Make & Model, and Capture Date).
- **SEO & Social Optimization** — JSON-LD structured data (Schema.org `Photograph`, `CollectionPage`, `ItemList`, `Person`), dynamic OpenGraph cards, and automated sitemaps.

### 🌐 Public Wallpaper API (`/api/v1/photos/random`)

- **Structured JSON & Direct Redirects** — Fetch random curated wallpapers with technical metadata or redirect straight to CDN-optimized images (`?redirect=true`).
- **Aspect Ratio & Orientation Filters** — Request desktop or mobile wallpapers dynamically (`?orientation=landscape|portrait`).
- **High-Availability Edge Fallbacks** — Serves static, production-grade fallback assets if external databases or CDN pipelines experience downtime.
- **Sliding Window Rate Limiting** — Enforces a 60 requests/hour fair-use limit per IP backed by Upstash Redis with memory fallbacks.
- **Interactive Developer Playground** — Live API testbed and interactive documentation hosted directly at `/developers`.

### 🔒 Studio CMS & Admin Dashboard (`/admin`)

- **Database-Backed Sessions** — Stateful session tracking in Supabase (`admin_sessions`) with instant single-device logout and multi-device global revocation ("Log out all devices").
- **Leaked-Secret Defense** — Tokens require an active database session record; attackers with stolen JWT signing secrets cannot forge valid admin access without passing bcrypt password checks.
- **Brute-Force Lockout** — Distributed IP-based and global attempt throttling with automatic lockout periods.
- **Direct-to-Cloudinary Uploads** — Client-side uploads signed via server-side HMAC signatures, avoiding server payload bottlenecks.
- **Hardened Cookies** — Session cookies strictly enforce `__Host-` prefixes, `HttpOnly`, `SameSite=Strict`, and `Secure` attributes in production.

---

## 🌐 Public Wallpaper API

Momented exposes a free, public API for developers, wallpaper apps, and personal scripts:

```bash
# Fetch a random landscape wallpaper JSON payload
curl "https://momented.vercel.app/api/v1/photos/random?orientation=landscape"

# Redirect directly to the optimized image asset
curl -L "https://momented.vercel.app/api/v1/photos/random?orientation=portrait&redirect=true"
```

### Supported Query Parameters

| Parameter     | Type                      | Default | Description                                                                  |
| :------------ | :------------------------ | :------ | :--------------------------------------------------------------------------- |
| `orientation` | `portrait` \| `landscape` | `none`  | Filter photos by orientation.                                                |
| `redirect`    | `boolean`                 | `false` | When `true`, returns a `302` redirect directly to the optimized CDN image.   |
| `raw`         | `boolean`                 | `false` | When paired with `redirect=true`, redirects to the uncompressed master file. |
| `download`    | `boolean`                 | `false` | When `true`, redirects with an attachment header for instant download.       |

Visit [`/developers`](https://momented.vercel.app/developers) for the full interactive API documentation and query generator.

---

## 🛠️ Tech Stack

| Domain                      | Technologies                                                                                                                        |
| :-------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend Framework**      | [Next.js 16](https://nextjs.org/) (App Router, Server Actions, Cache Components), [React 19](https://react.dev/)                    |
| **Styling & Layout**        | [Tailwind CSS v4](https://tailwindcss.com/), Lucide Icons, Custom Editorial Typography                                              |
| **Database & Auth**         | [Supabase](https://supabase.com/) (PostgreSQL, Row-Level Security, Database Functions)                                              |
| **Media & CDN**             | [Cloudinary](https://cloudinary.com/) (Signed Direct Uploads, Auto-Format Delivery, Strict Transformations)                         |
| **Rate Limiting & Caching** | [Upstash Redis](https://upstash.com/), React 19 `use cache` architecture                                                            |
| **Tooling & Engine**        | [Bun](https://bun.sh/), [Biome](https://biomejs.dev/), [ESLint](https://eslint.org/), [TypeScript](https://www.typescriptlang.org/) |

---

## 📸 Screenshots

|                              Desktop Editorial Studio                              |                            Mobile Browsing Experience                            |
| :--------------------------------------------------------------------------------: | :------------------------------------------------------------------------------: |
| <img src="/public/screenshots/desktop.png" alt="Desktop Screenshot" width="550" /> | <img src="/public/screenshots/mobile.png" alt="Mobile Screenshot" width="260" /> |

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.2 or higher)
- Active accounts with [Supabase](https://supabase.com/) and [Cloudinary](https://cloudinary.com/)
- (Optional) An [Upstash Redis](https://upstash.com/) database for distributed rate limiting

### 1. Clone & Install

```bash
git clone https://github.com/ijaik/momented.git
cd momented
bun install
```

### 2. Configure Environment Variables

Create a `.env.local` file based on the table below:

```bash
cp .env.example .env.local
```

### 3. Database Setup

Execute the schema migrations located in [`src/lib/db/admin_sessions.sql`](src/lib/db/admin_sessions.sql) in your **Supabase SQL Editor** to establish the `admin_sessions` table and Row-Level Security policies.

### 4. Run Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The studio admin portal is accessible at [`/admin/login`](http://localhost:3000/admin/login).

---

## ⚙️ Environment Variables

| Variable                               | Required | Description                                                                                                                        |
| :------------------------------------- | :------: | :--------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                 | Optional | Canonical site origin (e.g. `https://momented.vercel.app` or `http://localhost:3000`).                                             |
| `NEXT_PUBLIC_SUPABASE_URL`             | **Yes**  | Your Supabase project URL (`https://<project>.supabase.co`).                                                                       |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **Yes**  | Your Supabase public anonymous API key.                                                                                            |
| `SUPABASE_SECRET_KEY`                  | **Yes**  | Your Supabase service role secret key (never exposed to client).                                                                   |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`    | **Yes**  | Cloudinary cloud identifier.                                                                                                       |
| `CLOUDINARY_API_KEY`                   | **Yes**  | Cloudinary API access key.                                                                                                         |
| `CLOUDINARY_API_SECRET`                | **Yes**  | Cloudinary API secret for HMAC signing.                                                                                            |
| `ADMIN_PASSWORD_HASH`                  | **Yes**  | Bcrypt hash of your admin password (e.g. generated via `bun -e "console.log(require('bcryptjs').hashSync('your_password', 12))"`). |
| `ADMIN_SESSION_SECRET`                 | **Yes**  | 32+ character high-entropy secret string for signing JWT tokens.                                                                   |
| `UPSTASH_REDIS_REST_URL`               | Optional | Upstash Redis REST endpoint for distributed rate limiting and brute-force lockout.                                                 |
| `UPSTASH_REDIS_REST_TOKEN`             | Optional | Upstash Redis REST authorization token.                                                                                            |

---

## 🧪 Quality Checks & Testing

Momented maintains a zero-error policy across typechecking, linting, and automated unit testing:

```bash
# Run the complete test suite (65 tests across 8 suites)
bun test

# Typecheck TypeScript definitions
bun run typecheck

# Check code formatting & linting with Biome and ESLint
bun run lint

# Automatically apply safe lint & formatting fixes
bun run lint:fix
```

---

## 📁 Project Structure

```text
├── public/                     # Static media, fallback assets & PWA icons
│   ├── fallback-photos/        # High-availability edge offline fallback images
│   ├── icons/                  # Web app icons and favicons
│   └── screenshots/            # Showcase desktop and mobile captures
├── src/
│   ├── actions/                # Next.js Server Actions (auth, photos, collections, series)
│   ├── app/                    # Next.js App Router
│   │   ├── (main)/             # Public pages (gallery, photo detail, hub, developers)
│   │   ├── admin/              # Studio editorial CMS & authentication
│   │   ├── api/v1/             # Public Wallpaper API endpoint routes
│   │   ├── proxy.ts            # Next.js Edge proxy for session protection & URL cleansing
│   ├── components/             # Shared UI components (masonry, lightbox, buttons, toast)
│   ├── config/                 # Site configuration and Cloudinary folder mappings
│   ├── lib/
│   │   ├── auth/               # Database-backed session auth, JWT, & rate limiting
│   │   ├── cache/              # Cache tag helpers and revalidation utilities
│   │   ├── cloudinary/         # Cloudinary SDK client & signed upload handling
│   │   ├── db/                 # Supabase query pools, mutations, & SQL migration files
│   │   └── utils/              # Metadata, date, EXIF formatting, & JSON-LD helpers
│   └── types/                  # TypeScript database & application entity interfaces
└── tests/                      # Automated Bun test suites
```

---

## 📄 License

This repository is dual-licensed to distinguish between software code and photographic artistic works:

- **💻 Software Code:** The codebase is licensed under the [MIT License](LICENSE).
- **🖼️ Photography Works:** All photographs are dedicated to the public domain under the [Creative Commons CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/). You are free to view, download, modify, distribute, and use the images for personal or commercial projects without asking permission or providing attribution.

---

<div align="center">
  Crafted by <a href="https://github.com/ijaik">Jai</a> · Photographs under <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0 1.0 Universal</a>
</div>
