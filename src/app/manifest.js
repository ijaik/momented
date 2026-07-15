const icon = [
  {
    src: "/icons/icon-192.png",
    sizes: "192x192",
    type: "image/png",
    purpose: "any",
  },
  {
    src: "/icons/icon-512.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "any",
  },
  {
    src: "/icons/icon-monochrome-192.png",
    sizes: "192x192",
    type: "image/png",
    purpose: "monochrome maskable",
  },
  {
    src: "/icons/icon-monochrome-512.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "monochrome maskable",
  },
];
export default function manifest() {
  return {
    id: "/",
    start_url: "/",
    scope: "/",
    name: "Momented | Captured Moment",
    short_name: "Momented",
    description:
      "A momented journal by Jai, exploring light, shadow, and moments in between.",
    lang: "en-US",
    dir: "ltr",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    orientation: "portrait",
    launch_handler: {
      client_mode: ["navigate-existing", "auto"],
    },
    background_color: "#fafafa",
    theme_color: "#ffffff",
    prefer_related_applications: false,
    categories: ["photo", "lifestyle", "portfolio", "entertainment"],
    icons: icon,
    shortcuts: [
      {
        name: "View Collections",
        short_name: "Collections",
        description: "Browse curated photo collections.",
        url: "/collections",
        icons: icon,
      },
      {
        name: "Read Stories",
        short_name: "Stories",
        description: "Read the stories behind each captured moment.",
        url: "/stories",
        icons: icon,
      },
      {
        name: "About Jai",
        short_name: "About",
        description: "Learn more about the creator.",
        url: "/me",
        icons: icon,
      },
    ],
    screenshots: [
      {
        src: "/screenshots/mobile.png",
        sizes: "720x1280",
        type: "image/png",
        form_factor: "narrow",
        label: "Momented on mobile",
      },
      {
        src: "/screenshots/desktop.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Momented on desktop",
      },
    ],
  };
}
