import type { Metadata, Viewport } from "next";
import {
  Instrument_Serif,
  JetBrains_Mono,
  Schibsted_Grotesk,
} from "next/font/google";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";
import "./globals.css";
const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-instrument-serif",
});
const schibsted = Schibsted_Grotesk({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-schibsted",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
  weight: ["400", "500"],
});
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  verification: {
    google: "GMp5Gc1BgPdvcJHZzWt8tXY79MP_U0BLy4pu-0-QNgA",
    other: {
      "msvalidate.01": "4A20B233D66302E0F38651D04CEFA6F8",
    },
  },
  title: {
    default: "Momented | Captured Moment",
    template: "%s | Momented",
  },
  description:
    "A photography journal documenting light, shadows, and everyday moments.",
  keywords: [
    "photography",
    "mobile photography",
    "everyday moments",
    "photographs journal",
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
    title: "Momented",
    description:
      "A photography journal documenting light, shadows, and everyday moments.",
    images: [
      {
        url: "/screenshots/desktop.png",
        width: 1280,
        height: 720,
        alt: "Momented",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Momented",
    description:
      "A photography journal documenting light, shadows, and everyday moments.",
    images: ["/screenshots/desktop.png"],
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      {
        url: "/icons/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
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
      color: "#FAFAFA",
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: "#0A0A0A",
    },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${schibsted.variable} ${jetbrains.variable}`}
    >
      <body className="flex min-h-screen flex-col overflow-x-clip font-sans">
        {children}
      </body>
    </html>
  );
}
