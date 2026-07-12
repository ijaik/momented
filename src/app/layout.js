import { Leckerli_One } from "next/font/google";
import "./globals.css";
const leckerli = Leckerli_One({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-leckerli",
});
export const metadata = {
  metadataBase: new URL("https://momented.vercel.app"),
  title: {
    default: "Momented",
    template: "%s | Momented",
  },
  description:
    "A momented journal by Jai, exploring light, shadow, and moments in between.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Momented",
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
export const viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${leckerli.variable}`}>
      <body className="min-h-screen overflow-x-hidden flex flex-col bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50">
        <div className="grow">{children}</div>
      </body>
    </html>
  );
}
