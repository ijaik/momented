export interface SiteConfig {
  name: string;
  author: {
    name: string;
    role: string;
    github: string;
  };
  url: string;
  description: string;
  license: string;
  cloudinary: {
    cloudName?: string;
    folderDev: string;
    folderProd: string;
  };
}
export const siteConfig: SiteConfig = {
  name: "Momented",
  author: {
    name: "Jai",
    role: "An observer behind the lens",
    github: "https://github.com/ijaik",
  },
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://momented.vercel.app",
  description:
    "A photography journal of light, shadow, & the moments in between.",
  license:
    "Photographs are dedicated to the public domain under Creative Commons CC0 1.0 Universal.",
  cloudinary: {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "momented",
    folderDev: "momented-dev",
    folderProd: "momented-prod",
  },
};
