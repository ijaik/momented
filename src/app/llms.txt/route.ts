import { cacheLife, cacheTag } from "next/cache";
import { siteConfig } from "@/config/site";
import {
  getCuratedCollections,
  getRuleCollectionsList,
  getSeriesList,
} from "@/lib/db/queries";

async function getLlmsText() {
  "use cache";
  cacheTag("llms-txt", "series", "collections", "photos");
  cacheLife("days");
  const [seriesRes, curatedRes, rulesRes] = await Promise.all([
    getSeriesList(),
    getCuratedCollections(),
    getRuleCollectionsList(),
  ]);
  const series = seriesRes.data ?? [];
  const collections = curatedRes.data ?? [];
  const rules = rulesRes.data ?? [];
  const seriesItems = series
    .slice(0, 15)
    .map(
      (s) =>
        `- [${s.title}](${siteConfig.url}/series/${s.id}): ${s.description || "A multi-photo visual narrative."}`,
    )
    .join("\n");
  const collectionItems = collections
    .slice(0, 15)
    .map(
      (c) =>
        `- [${c.title}](${siteConfig.url}/collections/${c.id}): ${c.description || "Thematic photography archive."}`,
    )
    .join("\n");
  const ruleItems = rules
    .slice(0, 15)
    .map(
      (r) =>
        `- [${r.title}](${siteConfig.url}/collections/rules/${r.id}): ${r.description || "Photographs exploring compositional rules."}`,
    )
    .join("\n");
  return `# ${siteConfig.name}

> A minimalist photography journal and open visual archive by Jai exploring light, shadow, and moments in between.

Momented (${siteConfig.url}) is an independent photography publication and image archive created and maintained by photographer Jai. The collection documents everyday stillness, architectural geometry, natural light, and quiet urban compositions.

All photographs published on Momented are dedicated to the public domain under the Creative Commons CC0 1.0 Universal Public Domain Dedication. Anyone is free to view, download in original high resolution, share, adapt, and use any image for personal, editorial, commercial, or creative projects without copyright restrictions, permission, or licensing fees. Attribution ("Jai / Momented") is appreciated but not legally required.

Each photograph is accompanied by authentic EXIF exposure metadata, including camera model, focal length, aperture, shutter speed, and ISO, preserving photographic craft and transparency.

## Primary Sections

- [Full Archive](${siteConfig.url}/): Chronological visual journal of all published photographic frames.
- [About & Licensing](${siteConfig.url}/about): Behind the lens, philosophical statement, CC0 public domain terms, and frequently asked questions.
- [Curated Series](${siteConfig.url}/series): Multi-frame cinematic visual narratives captured in the same continuum of light and time.
- [Curated Collections](${siteConfig.url}/collections): Thematic archives grouped by subject matter, mood, and atmosphere.
- [Rule Collections](${siteConfig.url}/collections/rules): Photographs composed under deliberate compositional constraints (e.g. Rule of Thirds, Leading Lines, Symmetry).
- [Calendar Collections](${siteConfig.url}/collections/calendar): Monthly visual archives documenting moments as seasons change.

## Curated Series
${seriesItems || "- None published yet."}

## Featured Collections
${collectionItems || "- None published yet."}

## Composition & Rule Archives
${ruleItems || "- None published yet."}

## Optional
- [Full LLM Catalog](${siteConfig.url}/llms-full.txt): Complete machine-readable catalog of all individual photographs and technical specifications.
`;
}
export async function GET() {
  const body = await getLlmsText();
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
