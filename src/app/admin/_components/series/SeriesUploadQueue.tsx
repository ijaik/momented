import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import Image from "next/image";
import type { QueuedSlideFile } from "./types";

interface SeriesUploadQueueProps {
  queuedFiles: QueuedSlideFile[];
  onClear: () => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: (index: number) => void;
  onUpdateTitle: (index: number, title: string) => void;
  onUpdateDescription: (index: number, description: string) => void;
  disabled?: boolean;
}
export default function SeriesUploadQueue({
  queuedFiles,
  onClear,
  onMove,
  onRemove,
  onUpdateTitle,
  onUpdateDescription,
  disabled = false,
}: SeriesUploadQueueProps) {
  if (queuedFiles.length === 0) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted">
          Queued Slides ({queuedFiles.length})
        </span>
        <button
          type="button"
          onClick={onClear}
          disabled={disabled}
          className="text-xs text-muted hover:text-ink disabled:opacity-40 cursor-pointer"
        >
          Clear all
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {queuedFiles.map((item, idx) => (
          <div
            key={`queued-${item.file.name}-${idx}`}
            className="group relative flex flex-col gap-3 rounded-xl border border-line/70 bg-soft/40 p-3.5 backdrop-blur-xs sm:flex-row sm:items-start"
          >
            <div className="flex items-center gap-3 sm:flex-col sm:items-center">
              <div className="relative aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-line bg-line sm:h-24 sm:w-24">
                <Image
                  unoptimized
                  src={item.preview}
                  alt={item.title || "A Momented Photograph"}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
                <span className="absolute top-1 left-1 rounded-sm bg-ink/80 px-1.5 py-0.5 text-[10px] font-mono text-paper">
                  #{idx + 1}
                </span>
              </div>
              <div className="flex items-center gap-1 sm:justify-center">
                <button
                  type="button"
                  onClick={() => onMove(idx, -1)}
                  disabled={disabled || idx === 0}
                  aria-label="Move slide up"
                  title="Move slide up"
                  className="rounded-full p-1.5 text-muted transition-all duration-150 hover:bg-surface hover:text-ink active:scale-98 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowUp size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onMove(idx, 1)}
                  disabled={disabled || idx === queuedFiles.length - 1}
                  aria-label="Move slide down"
                  title="Move slide down"
                  className="rounded-full p-1.5 text-muted transition-all duration-150 hover:bg-surface hover:text-ink active:scale-98 disabled:opacity-30 cursor-pointer"
                >
                  <ArrowDown size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  disabled={disabled}
                  aria-label="Remove slide from queue"
                  title="Remove slide from queue"
                  className="rounded-full p-1.5 text-muted transition-all duration-150 hover:bg-surface hover:text-danger active:scale-98 disabled:opacity-30 cursor-pointer"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-ink">
                  Slide {idx + 1}
                </span>
                <span className="truncate text-[11px] text-muted">
                  {item.file.name}
                </span>
              </div>
              <div>
                <input
                  id={`queued-slide-title-${idx}`}
                  name={`queued_slide_title_${idx}`}
                  type="text"
                  value={item.title}
                  disabled={disabled}
                  onChange={(e) => onUpdateTitle(idx, e.target.value)}
                  placeholder={`Slide title (leave empty for auto: Frame ${idx + 1})`}
                  aria-label={`Slide ${idx + 1} title`}
                  className="w-full rounded-md border border-line bg-surface px-3 py-1.5 text-xs text-ink placeholder:text-muted/60 focus:border-ink focus:outline-hidden disabled:opacity-60"
                />
              </div>
              <div>
                <textarea
                  id={`queued-slide-desc-${idx}`}
                  name={`queued_slide_desc_${idx}`}
                  rows={2}
                  value={item.description}
                  disabled={disabled}
                  onChange={(e) => onUpdateDescription(idx, e.target.value)}
                  placeholder="Slide description / caption (optional, defaults to series description)"
                  aria-label={`Slide ${idx + 1} description`}
                  className="w-full resize-none rounded-md border border-line bg-surface px-3 py-1.5 text-xs text-ink placeholder:text-muted/60 focus:border-ink focus:outline-hidden disabled:opacity-60"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
