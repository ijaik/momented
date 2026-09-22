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
}
export function buildPageMetadata({
  title,
  description,
  path,
  imageUrl,
  type = "website",
  publishedTime,
}: BuildPageMetadataOptions): Metadata {
  const url = `${siteConfig.url}${path}`;
  const fullTitle = `${title} | ${siteConfig.name}`;
  const ogImage = imageUrl
    ? {
        url: getSocialShareImageUrl(imageUrl),
        width: 1200,
        height: 630,
        alt: title,
      }
    : undefined;
  return {
    metadataBase: new URL(siteConfig.url),
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type,
      locale: "en_US",
      url,
      siteName: siteConfig.name,
      title: fullTitle,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(imageUrl ? { images: [getSocialShareImageUrl(imageUrl)] } : {}),
    },
  };
}
