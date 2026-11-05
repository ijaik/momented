import { Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import type { SeriesAdminItem } from "./types";
interface SeriesCardListProps {
  series: SeriesAdminItem[];
  isPending: boolean;
  onEdit: (item: SeriesAdminItem) => void;
  onDelete: (id: string) => void;
}
export default function SeriesCardList({
  series,
  isPending,
  onEdit,
  onDelete,
}: SeriesCardListProps) {
  return (
    <section aria-label="Existing series list">
      {series.length === 0 ? (
        <div className="rounded-lg border border-line bg-soft/40 p-12 text-center">
          <ImageIcon
            size={32}
            className="mx-auto mb-3 text-muted"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-ink">No series created yet</p>
          <p className="mt-1 text-xs text-muted">
            Create your first multi-photo series to display carousel slide
            stories.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line/70 bg-surface/75 backdrop-blur-md">
          <ul className="divide-y divide-line">
            {series.map((item) => {
              const coverPhoto =
                item.photos.find((p) => p.id === item.cover_photo_id) ||
                item.photos[0];
              return (
                <li
                  key={item.id}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line/70 bg-soft">
                      {coverPhoto ? (
                        <Image
                          src={coverPhoto.cloudinary_url}
                          alt={coverPhoto.title || "A Momented Photograph"}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-muted">
                          No cover
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate font-medium text-ink">
                        {item.title}
                      </h4>
                      <p className="mt-0.5 truncate text-xs text-muted">
                        {item.photos.length}{" "}
                        {item.photos.length === 1 ? "slide" : "slides"}
                        {item.description ? ` · ${item.description}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onEdit(item)}
                      disabled={isPending}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDelete(item.id)}
                      disabled={isPending}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
