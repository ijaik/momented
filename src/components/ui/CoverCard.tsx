import { ArrowUpRight, Layers } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CoverCardPhoto {
  id: string | number;
  cloudinary_url: string;
}
interface CoverCardItem {
  id: string | number;
  title: string;
  description?: string | null;
  cover_photo_id?: string | number | null;
  photos?: CoverCardPhoto[];
}
interface CoverCardProps {
  item: CoverCardItem;
  href: string;
  index: number;
  meta?: string;
  countLabel?: { singular: string; plural: string };
}
export default function CoverCard({
  item,
  href,
  index,
  meta,
  countLabel,
}: CoverCardProps) {
  const coverImage =
    item.photos?.find((p) => p.id === item.cover_photo_id)?.cloudinary_url ||
    item.photos?.[0]?.cloudinary_url;
  const photoCount = item.photos?.length || 0;
  const singular = countLabel?.singular || "photograph";
  const plural = countLabel?.plural || "photographs";
  return (
    <Link href={href} className="focus-media group block">
      <div className="relative aspect-4/3 overflow-hidden rounded-xs border border-line/70 bg-soft shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all duration-500 group-hover:border-signal/50 group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.09)]">
        {coverImage ? (
          <>
            <Image
              src={coverImage}
              alt={
                item.description &&
                item.title &&
                item.description !== item.title
                  ? `${item.title} — ${item.description}`
                  : item.title ||
                    item.description ||
                    "A Momented collection cover"
              }
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              priority={index === 0}
              fetchPriority={index === 0 ? "high" : "low"}
              loading={index === 0 ? "eager" : "lazy"}
            />
            {photoCount > 0 && (
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white/95 backdrop-blur-md shadow-xs">
                <Layers
                  size={12}
                  aria-hidden="true"
                  className="shrink-0 text-white/80"
                />
                <span>
                  {photoCount} {photoCount === 1 ? singular : plural}
                </span>
              </span>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm text-muted">No cover yet</span>
          </div>
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h2 className="flex items-center gap-1.5 font-serif text-2xl font-medium leading-tight tracking-tight text-ink transition-colors group-hover:text-signal">
          <span>{item.title}</span>
          <ArrowUpRight
            size={16}
            aria-hidden="true"
            className="shrink-0 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
          />
        </h2>
        {meta && (
          <span className="shrink-0 text-[13px] text-muted">{meta}</span>
        )}
      </div>
      {item.description && (
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
          {item.description}
        </p>
      )}
    </Link>
  );
}
