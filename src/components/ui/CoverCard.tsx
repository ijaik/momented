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
}
export default function CoverCard({ item, href, index, meta }: CoverCardProps) {
  const coverImage =
    item.photos?.find((p) => p.id === item.cover_photo_id)?.cloudinary_url ||
    item.photos?.[0]?.cloudinary_url;
  const photoCount = item.photos?.length || 0;
  return (
    <Link href={href} className="focus-media group block">
      <div className="relative aspect-4/3 overflow-hidden border border-line bg-soft">
        {coverImage ? (
          <Image
            src={coverImage}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
            priority={index < 4}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm text-muted">No cover yet</span>
          </div>
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h2 className="font-serif text-2xl font-medium leading-tight tracking-tight text-ink transition-opacity group-hover:opacity-70">
          {item.title}
        </h2>
        {meta && (
          <span className="shrink-0 text-[13px] text-muted">{meta}</span>
        )}
      </div>
      {photoCount > 0 && (
        <p className="mt-1 text-[13px] text-muted">
          {photoCount} {photoCount === 1 ? "photograph" : "photographs"}
        </p>
      )}
    </Link>
  );
}
