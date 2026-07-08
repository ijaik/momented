export default function manifest() {
  return {
    name: "Momented | Captured Moment",
    short_name: "Momented",
    description:
      "A momented journal by Jai, exploring light, shadow, and moments in between.",
    start_url: "/",
    id: "/",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    launch_handler: {
      client_mode: ["navigate-existing", "auto"],
    },
    orientation: "portrait",
    lang: "en-US",
    dir: "ltr",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    categories: ["photo", "lifestyle", "portfolio", "entertainment"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-180.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
    shortcuts: [
      {
        name: "View Collections",
        short_name: "Collections",
        description: "Collections of momented",
        url: "/collections",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        ],
      },
      {
        name: "Read Stories",
        short_name: "Stories",
        description: "Thoughts behind the momented",
        url: "/stories",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        ],
      },
      {
        name: "About Jai",
        short_name: "About",
        description: "Learn more about the creator",
        url: "/me",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        ],
      },
    ],
  };
}
