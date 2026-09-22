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
    role: "An observer & narrator",
    github: "https://github.com/ijaik",
  },
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://momented.vercel.app",
  description:
    "A momented journal exploring light, shadow, and moments in between.",
  license:
    "The photographs can speak for themselves. If you mention where they came from, I'm grateful.",
  cloudinary: {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    folderDev: "momented-dev",
    folderProd: "momented-prod",
  },
};
