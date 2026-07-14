<div align="center">
  <br />
  <h1>📷 Momented</h1>
  <p>
    <b>A minimalist photo journal exploring light, shadow, and the moments in between.</b>
  </p>
  <p>
    <a href="https://github.com/ijaik/momented/blob/main/LICENSE"><img src="https://img.shields.io/badge/Code_License-MIT-blue.svg?style=for-the-badge" alt="MIT License" /></a>
    <a href="https://github.com/ijaik/momented/blob/main/LICENSE-MEDIA"><img src="https://img.shields.io/badge/Content_License-CC_BY_4.0-purple.svg?style=for-the-badge" alt="CC BY 4.0 License" /></a>
    <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  </p>
</div>

<br />

> "Momented" is a personal portfolio and content management system designed to showcase photography while allowing visitors to easily download and use the captured moments.
> Art is meant to be shared, not locked away.

---

## 📑 Table of Contents

- ✨ Features
- 🛠️ Tech Stack
- 📸 Screenshots
- 🚀 Getting Started
- ⚙️ Environment Variables
- 📄 License

---

## ✨ Features

- **Masonry Photo Grid** — A beautiful, responsive gallery designed specifically for high-resolution images.
- **Collections & Stories** — Group photos by thematic collections or write long-form narratives to accompany your visual stories.
- **High-Res Downloads** — Built-in functionality for visitors to download original, high-resolution images directly.
- **Exif Data Extraction** — Automatically reads and displays camera metadata (Focal Length, Aperture, Shutter Speed, ISO, Camera Model) when viewing a photo.
- **Secure Admin Dashboard** — A protected route (`/admin`) utilizing JWT authentication to upload photos, create collections, and write stories.
- **Direct Cloudinary Uploads** — Secure, signed image uploads directly from the admin dashboard to your Cloudinary storage.

---

## 🛠️ Tech Stack

| Category                        | Technologies                             |
| :------------------------------ | :--------------------------------------- |
| **Frontend & Framework**        | Next.js 16 (App Router), Tailwind CSS v4 |
| **Backend, Database & Storage** | Supabase (PostgreSQL), Cloudinary        |
| **Security & Tooling**          | jose (JWT), bcryptjs, Biome, Bun         |

---

## 📸 Screenshots

| Mobile View                                                                    | Desktop View                                                                     |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| <img src="/public/screenshots/mobile.png" alt="Mobile Screenshot" width="300"> | <img src="/public/screenshots/desktop.png" alt="Desktop Screenshot" width="600"> |

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

1. Clone the repository using `git clone https://github.com/ijaik/momented.git` and navigate into the directory.
2. Install dependencies by running `bun install` in your terminal.
3. Start the development server by executing `bun run dev`.
4. Open `http://localhost:3000` in your browser to see the live site.
5. To access the CMS, navigate to `/admin/login`.

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory. You will need active accounts with Supabase and Cloudinary.

| Variable                               | Description                                          |
| :------------------------------------- | :--------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Your Supabase database URL.                          |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anonymous key.                         |
| `SUPABASE_SECRET_KEY`                  | Your Supabase service role key.                      |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`    | Your Cloudinary cloud name.                          |
| `CLOUDINARY_API_KEY`                   | Your Cloudinary API key.                             |
| `CLOUDINARY_API_SECRET`                | Your Cloudinary API secret.                          |
| `ADMIN_PASSWORD_HASH`                  | Your bcrypt hashed password for the admin dashboard. |
| `ADMIN_SESSION_SECRET`                 | A long, random, secure string for JWT encryption.    |

> **💡 Tip:** Generate `ADMIN_PASSWORD_HASH` by hashing your desired admin password using bcrypt. Generate a long, random string for `ADMIN_SESSION_SECRET`.

---

## 📄 License

This repository is dual-licensed to accommodate both open-source software development and the open sharing of photography assets.

- **💻 Codebase:** The source code in this repository is licensed under the MIT License.[cite: 2, 4] You are free to use, modify, and distribute the code to build your own projects.
- **🖼️ Photography & Content:** All original photography, content, and written narratives are licensed under a Creative Commons Attribution 4.0 International License (CC BY 4.0).[cite: 3, 4] You are free to download, share, and adapt the photography for any purpose, even commercially, provided you give appropriate credit to the original creator.
