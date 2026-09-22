import type { JsonLdObject } from "@/lib/seo/jsonLd";

interface JsonLdProps {
  data: JsonLdObject | JsonLdObject[];
}
export default function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires raw script tag content
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
