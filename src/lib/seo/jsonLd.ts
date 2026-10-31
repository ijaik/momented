import { siteConfig } from "@/config/site";
import { getSocialShareImageUrl } from "@/lib/cloudinary/cloudinaryUtils";
import type { Photo } from "@/types";

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
export function websiteJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    alternateName: ["Momented Photography", "Momented Journal"],
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "en-US",
    author: {
      "@type": "Person",
      "@id": `${siteConfig.url}/#author`,
      name: siteConfig.author.name,
      url: siteConfig.author.github,
    },
    publisher: {
      "@type": "Person",
      "@id": `${siteConfig.url}/#author`,
      name: siteConfig.author.name,
      url: siteConfig.author.github,
    },
    license: "https://creativecommons.org/publicdomain/zero/1.0/",
  };
}
export function personJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteConfig.url}/#author`,
    name: siteConfig.author.name,
    jobTitle: siteConfig.author.role,
    description: siteConfig.description,
    url: siteConfig.url,
    sameAs: [siteConfig.author.github],
    image: `${siteConfig.url}/screenshots/desktop.png`,
  };
}
export function aboutPageJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `About ${siteConfig.name} — ${siteConfig.author.name}`,
    description: siteConfig.description,
    url: `${siteConfig.url}/about`,
    mainEntity: {
      "@type": "Person",
      "@id": `${siteConfig.url}/#author`,
      name: siteConfig.author.name,
    },
    isPartOf: {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}
export function faqPageJsonLd(
  faqs: { question: string; answer: string }[],
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
export function hubPageJsonLd({
  title,
  description,
  url,
  items,
}: {
  title: string;
  description: string;
  url: string;
  items: {
    name: string;
    url: string;
    description?: string | null;
    image?: string | null;
  }[];
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url,
    isPartOf: {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: item.url,
        ...(item.description ? { description: item.description } : {}),
        ...(item.image ? { image: getSocialShareImageUrl(item.image) } : {}),
      })),
    },
  };
}
export function breadcrumbJsonLd(
  items: { name: string; url: string }[],
): JsonLdObject {
  const hasHome = items.length > 0 && items[0].url === `${siteConfig.url}/`;
  const allItems = hasHome
    ? items
    : [{ name: "Home", url: `${siteConfig.url}/` }, ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: allItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
export function photographJsonLd(photo: Photo): JsonLdObject {
  const name = photo.title || "A Momented Photograph";
  const artistName = photo.artist || siteConfig.author.name;
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "@id": `${siteConfig.url}/photo/${photo.id}#image`,
    name,
    caption: photo.description || name,
    description:
      photo.description ||
      `Photograph "${name}" exploring light and shadow by ${artistName}.`,
    contentUrl: photo.cloudinary_url,
    thumbnailUrl: getSocialShareImageUrl(photo.cloudinary_url),
    encodingFormat: "image/jpeg",
    url: `${siteConfig.url}/photo/${photo.id}`,
    image: getSocialShareImageUrl(photo.cloudinary_url),
    representativeOfPage: true,
    inLanguage: "en-US",
    genre: "Fine Art Photography",
    isPartOf: {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      name: siteConfig.name,
      url: siteConfig.url,
    },
    ...(photo.created_at ? { datePublished: photo.created_at } : {}),
    ...(photo.taken_at ? { dateCreated: photo.taken_at } : {}),
    creator: {
      "@type": "Person",
      "@id": `${siteConfig.url}/#author`,
      name: artistName,
      url: siteConfig.author.github,
    },
    author: {
      "@type": "Person",
      "@id": `${siteConfig.url}/#author`,
      name: artistName,
      url: siteConfig.author.github,
    },
    copyrightHolder: {
      "@type": "Person",
      "@id": `${siteConfig.url}/#author`,
      name: artistName,
    },
    creditText: `${artistName} / Momented`,
    copyrightNotice: "CC0 1.0 Universal Public Domain Dedication",
    license: "https://creativecommons.org/publicdomain/zero/1.0/",
    acquireLicensePage: `${siteConfig.url}/about`,
    ...(photo.width ? { width: photo.width } : {}),
    ...(photo.height ? { height: photo.height } : {}),
    ...(photo.camera_model
      ? {
          exifData: [
            {
              "@type": "PropertyValue",
              name: "Camera",
              value: photo.camera_model,
            },
            ...(photo.focal_length
              ? [
                  {
                    "@type": "PropertyValue",
                    name: "Focal Length",
                    value: photo.focal_length,
                  },
                ]
              : []),
            ...(photo.aperture
              ? [
                  {
                    "@type": "PropertyValue",
                    name: "Aperture",
                    value: photo.aperture,
                  },
                ]
              : []),
            ...(photo.shutter_speed
              ? [
                  {
                    "@type": "PropertyValue",
                    name: "Shutter Speed",
                    value: photo.shutter_speed,
                  },
                ]
              : []),
            ...(photo.iso
              ? [
                  {
                    "@type": "PropertyValue",
                    name: "ISO",
                    value: String(photo.iso),
                  },
                ]
              : []),
          ],
        }
      : {}),
  };
}
export function photoPageJsonLd(photo: Photo): JsonLdObject {
  const name = photo.title || "A Momented Photograph";
  const artistName = photo.artist || siteConfig.author.name;
  return {
    "@context": "https://schema.org",
    "@type": "ItemPage",
    "@id": `${siteConfig.url}/photo/${photo.id}#webpage`,
    url: `${siteConfig.url}/photo/${photo.id}`,
    name: `${name} — ${siteConfig.name}`,
    description:
      photo.description ||
      `Photograph "${name}" exploring light and shadow by ${artistName}.`,
    inLanguage: "en-US",
    isPartOf: {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      name: siteConfig.name,
      url: siteConfig.url,
    },
    primaryImageOfPage: {
      "@type": "ImageObject",
      "@id": `${siteConfig.url}/photo/${photo.id}#image`,
      contentUrl: photo.cloudinary_url,
      thumbnailUrl: getSocialShareImageUrl(photo.cloudinary_url),
      url: `${siteConfig.url}/photo/${photo.id}`,
      name,
    },
    mainEntity: {
      "@type": "ImageObject",
      "@id": `${siteConfig.url}/photo/${photo.id}#image`,
    },
  };
}
export function homePageGalleryJsonLd(
  photos: {
    id: string;
    title?: string | null;
    description?: string | null;
    cloudinary_url: string;
  }[],
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${siteConfig.name} — Photography Gallery & Journal`,
    description: siteConfig.description,
    url: `${siteConfig.url}/`,
    inLanguage: "en-US",
    isPartOf: {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: photos.length,
      itemListElement: photos.slice(0, 50).map((photo, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: photo.title || `Moment ${index + 1}`,
        url: `${siteConfig.url}/photo/${photo.id}`,
        image: getSocialShareImageUrl(photo.cloudinary_url),
        ...(photo.description ? { description: photo.description } : {}),
      })),
    },
  };
}
export function collectionPageJsonLd(
  collection: { title: string; description?: string | null },
  url: string,
  coverImageUrl?: string | null,
  photoItems: {
    id: string | number;
    title?: string | null;
    cloudinary_url: string;
  }[] = [],
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
      "@id": `${siteConfig.url}/#website`,
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: photos.length,
      itemListElement: photos.map((photo, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: photo.title || `Frame ${index + 1}`,
        url: `${siteConfig.url}/photo/${photo.id}`,
        image: getSocialShareImageUrl(photo.cloudinary_url),
      })),
    },
  };
}
export function seriesPageJsonLd(
  series: { title: string; description?: string | null; created_at?: string },
  url: string,
  photos: { id: string; title?: string | null; cloudinary_url: string }[] = [],
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: series.title,
    ...(series.description ? { description: series.description } : {}),
    ...(series.created_at ? { datePublished: series.created_at } : {}),
    url,
    ...(photos[0]
      ? { image: getSocialShareImageUrl(photos[0].cloudinary_url) }
      : {}),
    author: {
      "@type": "Person",
      "@id": `${siteConfig.url}/#author`,
      name: siteConfig.author.name,
      url: siteConfig.author.github,
    },
    isPartOf: {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: photos.length,
      itemListElement: photos.map((photo, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: photo.title || `Frame ${index + 1}`,
        url: `${siteConfig.url}/photo/${photo.id}`,
        image: getSocialShareImageUrl(photo.cloudinary_url),
      })),
    },
  };
}
