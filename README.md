Momented 📷

A minimalist photo journal exploring light, shadow, and the moments in between.

"Momented" is a custom-built portfolio and content management system designed to showcase photography while allowing visitors to easily download and use the captured moments. Art is meant to be shared, not locked away.

✨ Features

Masonry Photo Grid: A beautiful, responsive gallery for high-resolution images.

Collections & Stories: Group photos by thematic collections or write long-form narratives to accompany your visual stories.

High-Res Downloads: Built-in functionality for visitors to download original, high-resolution images directly.

Exif Data Extraction: Automatically reads and displays camera metadata (Focal Length, Aperture, Shutter Speed, ISO, Camera Model) when viewing a photo.

Secure Admin Dashboard: A protected route (/admin) utilizing JWT authentication to upload photos, create collections, and write stories.

Direct Cloudinary Uploads: Secure, signed image uploads directly from the admin dashboard to Cloudinary.

🛠️ Tech Stack

Framework: Next.js 16 (App Router)

Styling: Tailwind CSS v4

Database & Auth: Supabase (PostgreSQL)

Image Hosting & Processing: Cloudinary

Authentication: jose (JWT) & bcryptjs

Formatting/Linting: Biome

🚀 Getting Started

1. Clone the repository

git clone https://github.com/ijaik/momented.git
cd momented


2. Install dependencies

bun install


3. Set up Environment Variables

Create a .env.local file in the root directory and add the following keys. You will need accounts with Supabase and Cloudinary.

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
SUPABASE_SECRET_KEY=your_supabase_service_role_key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin Authentication
ADMIN_PASSWORD_HASH=your_bcrypt_hashed_password
ADMIN_SESSION_SECRET=a_long_random_secure_string_for_jwt


(Note: Generate ADMIN_PASSWORD_HASH by hashing your desired admin password using bcrypt).

4. Run the development server

bun run dev


Open http://localhost:3000 with your browser to see the result. To access the CMS, navigate to /admin/login.

📄 License

Codebase: The source code in this repository is licensed under the MIT License. You are free to use, modify, and distribute the code to build your own projects.

Photography & Content: All original photography and written narratives are licensed under a Creative Commons Attribution 4.0 International License (CC BY 4.0).

Art is meant to be shared. You are free to download, share, and adapt the photography for any purpose, even commercially, provided you give appropriate credit to the original creator.