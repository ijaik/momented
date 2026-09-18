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
});
const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-fraunces",
});
const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-schibsted",
});
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Momented",
    template: "%s | Momented",
  },
  description:
    "A momented journal by Jai, exploring light, shadow, and moments in between.",
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
      "A momented journal by Jai, exploring light, shadow, and moments in between.",
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
      "A momented journal by Jai, exploring light, shadow, and moments in between.",
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
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-200 -translate-y-20 rounded-md bg-solid px-4 py-2 text-sm font-medium text-on-solid opacity-0 transition-none focus:translate-y-0 focus:opacity-100"
        >
          Skip to content
        </a>
        <div className="grow" id="main-content" tabIndex={-1}>
          {children}
        </div>
      </body>
    </html>
  );
}