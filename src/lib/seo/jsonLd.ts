import { siteConfig } from "@/config/site";
import { getSocialShareImageUrl } from "@/lib/cloudinary/cloudinaryUtils";
import type { Photo, Story } from "@/types";

type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | JsonLdValue[]
  | { [key: string]: JsonLdValue };

export type JsonLdObject = {
  "@context": "https://schema.org";
  "@type": string;
} & { [key: string]: JsonLdValue };
function personRef(name = siteConfig.author.name, url?: string) {
  return {
    "@type": "Person",
    name,
    ...(url ? { url } : {}),
  };
}
export function websiteJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "en",
    author: personRef(siteConfig.author.name, siteConfig.author.github),
  };
}
export function personJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.author.name,
    description: siteConfig.author.role,
    url: siteConfig.url,
    sameAs: [siteConfig.author.github],
  };
}
export function breadcrumbJsonLd(
  items: { name: string; url: string }[],
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
export function photographJsonLd(photo: Photo): JsonLdObject {
  const name = photo.title || "Untitled";
  return {
    "@context": "https://schema.org",
    "@type": "Photograph",
    name,
    ...(photo.description ? { description: photo.description } : {}),
    image: getSocialShareImageUrl(photo.cloudinary_url),
    contentUrl: photo.cloudinary_url,
    url: `${siteConfig.url}/photo/${photo.id}`,
    datePublished: photo.created_at,
    ...(photo.taken_at ? { dateCreated: photo.taken_at } : {}),
    author: personRef(photo.artist || siteConfig.author.name),
    copyrightHolder: personRef(photo.artist || siteConfig.author.name),
  };
}
export function articleJsonLd(
  story: Pick<Story, "id" | "title" | "content" | "created_at">,
  coverImageUrl?: string | null,
): JsonLdObject {
  const url = `${siteConfig.url}/stories/${story.id}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: story.title,
    ...(coverImageUrl ? { image: getSocialShareImageUrl(coverImageUrl) } : {}),
    datePublished: story.created_at,
    dateModified: story.created_at,
    author: personRef(siteConfig.author.name, siteConfig.author.github),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    articleBody: story.content,
  };
}
export function collectionPageJsonLd(
  collection: { title: string; description?: string | null },
  url: string,
  coverImageUrl?: string | null,
  photoItems: { id: string | number; cloudinary_url: string }[] = [],
): JsonLdObject {
  const photos = photoItems.slice(0, 50);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.title,
    ...(collection.description ? { description: collection.description } : {}),
    ...(coverImageUrl ? { image: getSocialShareImageUrl(coverImageUrl) } : {}),
    url,
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: photos.length,
      itemListElement: photos.map((photo, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteConfig.url}/photo/${photo.id}`,
        image: getSocialShareImageUrl(photo.cloudinary_url),
      })),
    },
  };
}
