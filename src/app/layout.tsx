import type { Metadata, Viewport } from "next";
import { Fraunces, Leckerli_One, Schibsted_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";
import "./globals.css";
const leckerli = Leckerli_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-leckerli",
  preload: false,
});
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-fraunces",
  preload: false,
});
const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-schibsted",
  preload: false,
});
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  verification: {
    google: "GMp5Gc1BgPdvcJHZzWt8tXY79MP_U0BLy4pu-0-QNgA",
  },
  title: {
    default: "Momented — Minimalist Photography Journal & Gallery",
    template: "%s | Momented",
  },
  description:
    "A minimalist photography journal by Jai exploring light, shadow, and moments in between. Free high-resolution CC0 photography to view and download.",
  keywords: [
    "photography",
    "minimalist photography",
    "photo journal",
    "photography portfolio",
    "street photography",
    "architecture photography",
    "nature photography",
    "high-resolution downloads",
    "CC0 photography",
    "momented",
  ],
  authors: [{ name: siteConfig.author.name, url: siteConfig.author.github }],
  creator: siteConfig.author.name,
  publisher: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: "Momented",
    title: "Momented — Minimalist Photography Journal & Gallery",
    description:
      "A minimalist photography journal by Jai exploring light, shadow, and moments in between. Free high-resolution CC0 photography to view and download.",
    images: [
      {
        url: "/screenshots/desktop.png",
        width: 1280,
        height: 720,
        alt: "Momented — Minimalist Photography Journal & Gallery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Momented — Minimalist Photography Journal & Gallery",
    description:
      "A minimalist photography journal by Jai exploring light, shadow, and moments in between. Free high-resolution CC0 photography to view and download.",
    images: ["/screenshots/desktop.png"],
  },
  icons: {
    icon: [
      { url: "/icons/favicon.ico" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};
export const viewport: Viewport = {
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "#faf9f6",
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: "#171614",
    },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${leckerli.variable} ${fraunces.variable} ${schibsted.variable}`}
    >
      <body className="flex min-h-screen flex-col overflow-x-hidden font-sans">
        {children}
      </body>
    </html>
  );
}
