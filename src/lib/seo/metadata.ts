import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { getSocialShareImageUrl } from "@/lib/cloudinary/cloudinaryUtils";

interface BuildPageMetadataOptions {
  title: string;
  description?: string;
  path: string;
  imageUrl?: string | null;
  type?: "website" | "article";
  publishedTime?: string;
  keywords?: string[];
  noIndex?: boolean;
}
export function buildPageMetadata({
  title,
  description,
  path,
  imageUrl,
  type = "website",
  publishedTime,
  keywords,
  noIndex = false,
}: BuildPageMetadataOptions): Metadata {
  const url = `${siteConfig.url}${path}`;
  const fullTitle = title.includes(siteConfig.name)
    ? title
    : `${title} | ${siteConfig.name}`;
  const ogImage = imageUrl
    ? {
        url: getSocialShareImageUrl(imageUrl),
        width: 1200,
        height: 630,
        alt: title,
      }
    : {
        url: "/screenshots/desktop.png",
        width: 1280,
        height: 720,
        alt: fullTitle,
      };
  return {
    metadataBase: new URL(siteConfig.url),
    title,
    description,
    ...(keywords && keywords.length > 0 ? { keywords } : {}),
    alternates: { canonical: url },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type,
      locale: "en_US",
      url,
      siteName: siteConfig.name,
      title: fullTitle,
      description,
      images: [ogImage],
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [
        imageUrl
          ? getSocialShareImageUrl(imageUrl)
          : "/screenshots/desktop.png",
      ],
    },
  };
}
