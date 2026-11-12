import type { HTMLAttributes } from "react";
export type SkeletonVariant =
  | "default"
  | "photo"
  | "series"
  | "collection"
  | "calendar";
export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
}
export function SkeletonHeader() {
  return (
    <header className="my-8 sm:my-12 md:my-14 border-b border-line/70 pb-8 sm:pb-10 md:pb-12">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-px w-6 bg-ink/30" aria-hidden="true" />
        <div className="h-3 w-20 rounded-xs bg-soft" />
      </div>
      <div className="max-w-3xl">
        <div className="h-10 sm:h-12 w-3/5 rounded-xs bg-soft" />
        <div className="mt-4 h-4 w-4/5 rounded-xs bg-soft" />
        <div className="mt-2 h-4 w-1/2 rounded-xs bg-soft" />
      </div>
    </header>
  );
}
export function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8 animate-pulse">
      <div className="aspect-4/3 photo-frame bg-soft/70" />
      <div className="aspect-3/2 photo-frame bg-soft/70" />
      <div className="aspect-4/5 photo-frame bg-soft/70" />
      <div className="aspect-3/2 photo-frame bg-soft/70" />
      <div className="aspect-4/3 photo-frame bg-soft/70" />
      <div className="aspect-square photo-frame bg-soft/70" />
    </div>
  );
}
export function PhotoDetailSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true">
      {/* Top Navigation Row */}
      <div className="mt-6 md:mt-8 flex items-center justify-between border-b border-line/60 pb-4">
        <div className="h-3.5 w-28 rounded-xs bg-soft" />
        <div className="flex items-center gap-3">
          <div className="h-3.5 w-12 rounded-xs bg-soft" />
          <span className="text-line">/</span>
          <div className="h-3.5 w-12 rounded-xs bg-soft" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start xl:gap-x-16 mt-6 md:mt-10">
        {/* Left Column — Light Table Stage */}
        <figure className="min-w-0 lg:sticky lg:top-24">
          <div
            className="mx-auto w-full max-w-full bg-soft/60"
            style={{
              aspectRatio: "3 / 2",
              maxHeight: "min(78vh, calc(100vh - 10rem))",
            }}
          />
        </figure>
        {/* Right Column — Editorial & Technical Specification */}
        <aside className="flex min-w-0 flex-col">
          {/* Header Block */}
          <div className="border-b border-line/70 pb-6">
            <div className="h-8 sm:h-10 w-3/4 rounded-xs bg-soft" />
            <div className="mt-3.5 h-4 w-5/6 rounded-xs bg-soft" />
            <div className="mt-2 h-4 w-2/3 rounded-xs bg-soft" />
            <div className="mt-4 flex items-center gap-2">
              <div className="h-3 w-24 rounded-xs bg-soft" />
              <div className="h-3 w-32 rounded-xs bg-soft" />
            </div>
          </div>
          {/* Action CTAs */}
          <div className="mt-6 flex flex-col gap-2.5">
            {/* Primary Solid Download */}
            <div className="h-11 w-full rounded-full bg-soft" />
            {/* Secondary Side-by-Side */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="h-10 w-full rounded-full border border-line bg-surface" />
              <div className="h-10 w-full rounded-full border border-line bg-surface" />
            </div>
          </div>
          {/* Hairline EXIF Specification Grid */}
          <div className="mt-8">
            <div className="mb-2.5 h-3 w-32 rounded-xs bg-soft" />
            <div className="grid grid-cols-2 divide-x divide-y divide-line border border-line">
              <div className="h-14 bg-soft/30 p-3" />
              <div className="h-14 bg-soft/30 p-3" />
              <div className="h-14 bg-soft/30 p-3" />
              <div className="h-14 bg-soft/30 p-3" />
              <div className="h-14 bg-soft/30 p-3" />
              <div className="h-14 bg-soft/30 p-3" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
export function SeriesDetailSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true">
      <SkeletonHeader />
      <div className="mx-auto max-w-4xl">
        <div
          className="w-full rounded-xs bg-soft/60 max-h-[min(48svh,380px)] sm:max-h-[min(76vh,680px)]"
          style={{ aspectRatio: "16 / 10" }}
        />
        <div className="mt-5 flex items-center justify-between">
          <div className="h-3 w-28 rounded-xs bg-soft" />
          <div className="flex items-center gap-1.5">
            <div className="h-1 w-6 rounded-full bg-soft" />
            <div className="h-1 w-1.5 rounded-full bg-soft" />
            <div className="h-1 w-1.5 rounded-full bg-soft" />
          </div>
        </div>
      </div>
    </div>
  );
}
export function CollectionDetailSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true">
      <SkeletonHeader />
      <SkeletonGrid />
    </div>
  );
}
export function CalendarMonthSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true">
      <SkeletonHeader />
      <div className="mb-10 flex gap-7 sm:gap-9 overflow-x-auto border-b border-line/70 pb-3">
        <div className="h-3 w-12 rounded-xs bg-soft" />
        <div className="h-3 w-12 rounded-xs bg-soft" />
        <div className="h-3 w-12 rounded-xs bg-soft" />
        <div className="h-3 w-12 rounded-xs bg-soft" />
        <div className="h-3 w-12 rounded-xs bg-soft" />
        <div className="h-3 w-12 rounded-xs bg-soft" />
      </div>
      <SkeletonGrid />
    </div>
  );
}
export default function Skeleton({
  variant = "default",
  className = "",
  ...props
}: SkeletonProps) {
  if (variant === "photo") return <PhotoDetailSkeleton />;
  if (variant === "series") return <SeriesDetailSkeleton />;
  if (variant === "collection") return <CollectionDetailSkeleton />;
  if (variant === "calendar") return <CalendarMonthSkeleton />;
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-xs bg-soft ${className}`}
      {...props}
    />
  );
}
