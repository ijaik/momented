import CollectionsTabs from "@/components/collections/CollectionsTabs";
import JsonLd from "@/components/seo/JsonLd";
import CoverCard from "@/components/ui/CoverCard";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { siteConfig } from "@/config/site";
import { breadcrumbJsonLd, hubPageJsonLd } from "@/lib/seo/jsonLd";

interface CollectionHubItem {
  id: string | number;
  title: string;
  description?: string | null;
  cover_photo_id?: string | null;
  photos?: { id: string; cloudinary_url: string }[];
}
interface CollectionHubViewProps {
  activeTab: "curated" | "rules" | "calendar";
  badge: string;
  title: string;
  description: string;
  countLabel: { singular: string; plural: string };
  emptyMessage: string;
  baseHref: string;
  items: CollectionHubItem[];
  breadcrumbs: { name: string; url: string }[];
}
export default function CollectionHubView({
  activeTab,
  badge,
  title,
  description,
  countLabel,
  emptyMessage,
  baseHref,
  items,
  breadcrumbs,
}: CollectionHubViewProps) {
  const count = items.length;
  return (
    <>
      <JsonLd
        data={[
          hubPageJsonLd({
            title,
            description,
            url: `${siteConfig.url}${baseHref}`,
            items: items.map((col) => ({
              name: col.title,
              description: col.description,
              url: `${siteConfig.url}${baseHref}/${col.id}`,
              image: col.photos?.[0]?.cloudinary_url,
            })),
          }),
          breadcrumbJsonLd(breadcrumbs),
        ]}
      />
      <PageHeader
        badge={badge}
        title={title}
        description={description}
        meta={
          count > 0
            ? `${count} ${count === 1 ? countLabel.singular : countLabel.plural}`
            : undefined
        }
      />
      <CollectionsTabs activeTab={activeTab} />
      {count > 0 ? (
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2">
          {items.map((col, index) => (
            <CoverCard
              key={col.id}
              item={col}
              href={`${baseHref}/${col.id}`}
              preload={index < 2}
            />
          ))}
        </div>
      ) : (
        <EmptyState description={emptyMessage} />
      )}
    </>
  );
}
