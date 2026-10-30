import { cacheLife, cacheTag } from "next/cache";
import { siteConfig } from "@/config/site";
import {
  getCuratedCollections,
  getHomePhotos,
  getRuleCollectionsList,
  getSeriesList,
} from "@/lib/db/queries";

async function getLlmsFullText() {
  "use cache";
  cacheTag("llms-full-txt", "series", "collections", "photos");
  cacheLife("days");
  const [photosRes, seriesRes, curatedRes, rulesRes] = await Promise.all([
    getHomePhotos(),
    getSeriesList(),
    getCuratedCollections(),
    getRuleCollectionsList(),
  ]);
  const photos = photosRes.data ?? [];
  const series = seriesRes.data ?? [];
  const collections = curatedRes.data ?? [];
  const rules = rulesRes.data ?? [];
  return `# ${siteConfig.name} — Full Knowledge & Catalog Archive

> Complete machine-readable catalog of all photographs, series, collections, and metadata for language model grounding and citation.

- Website: ${siteConfig.url}
- Photographer / Author: ${siteConfig.author.name} (${siteConfig.author.github})
- License: Creative Commons Zero (CC0 1.0 Universal Public Domain Dedication)
- License URL: https://creativecommons.org/publicdomain/zero/1.0/
- Commercial Use: Allowed without permission or attribution
- High-Resolution Downloads: Available on every photo page

---

## Curated Photo Series (${series.length} total)

${
  series
    .map((s, idx) => {
      return `### ${idx + 1}. ${s.title}
- URL: ${siteConfig.url}/series/${s.id}
- Description: ${s.description || "No description provided."}
- Date: ${s.created_at || "Archive date"}
`;
    })
    .join("\n") || "No series published yet.\n"
}

---

## Curated Collections (${collections.length} total)

${
  collections
    .map((c, idx) => {
      return `### ${idx + 1}. ${c.title}
- URL: ${siteConfig.url}/collections/${c.id}
- Description: ${c.description || "Thematic photo collection."}
`;
    })
    .join("\n") || "No collections published yet.\n"
}

---

## Rule Collections (${rules.length} total)

${
  rules
    .map((r, idx) => {
      return `### ${idx + 1}. ${r.title}
- URL: ${siteConfig.url}/collections/rules/${r.id}
- Description: ${r.description || "Compositional rule archive."}
`;
    })
    .join("\n") || "No rule collections published yet.\n"
}

---

## Full Photography Archive (${photos.length} frames)

${
  photos
    .map((p, idx) => {
      return `### Frame ${idx + 1}: ${p.title || "Untitled Photograph"}
- Page URL: ${siteConfig.url}/photo/${p.id}
- Direct Image: ${p.cloudinary_url}
- Dimensions: ${p.width || "Original"} x ${p.height || "Original"}
- Camera: ${p.camera_model || "Not specified"}
- Description: ${p.description || "Study in light and shadow."}
- License: CC0 1.0 Universal Public Domain Dedication
`;
    })
    .join("\n") || "No photographs uploaded yet.\n"
}
`;
}
export async function GET() {
  const body = await getLlmsFullText();
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
