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
    <header className="my-8 md:my-10 border-b border-line pb-8">
      <div className="h-10 w-2/5 rounded-lg bg-soft sm:h-12" />
      <div className="mt-4 h-5 w-3/5 rounded-md bg-soft" />
      <div className="mt-2 h-4 w-28 rounded-md bg-soft" />
    </header>
  );
}
export function SkeletonGrid() {
  return (
    <div className="columns-1 sm:columns-2 gap-5 lg:columns-3 xl:gap-8">
      <div className="break-inside-avoid mb-5 xl:mb-8 aspect-4/3 rounded-xl border border-line/60 bg-soft" />
      <div className="break-inside-avoid mb-5 xl:mb-8 aspect-3/2 rounded-xl border border-line/60 bg-soft" />
      <div className="break-inside-avoid mb-5 xl:mb-8 aspect-square rounded-xl border border-line/60 bg-soft" />
      <div className="break-inside-avoid mb-5 xl:mb-8 aspect-4/3 rounded-xl border border-line/60 bg-soft" />
      <div className="break-inside-avoid mb-5 xl:mb-8 aspect-3/2 rounded-xl border border-line/60 bg-soft" />
      <div className="break-inside-avoid mb-5 xl:mb-8 aspect-square rounded-xl border border-line/60 bg-soft" />
    </div>
  );
}
export function PhotoDetailSkeleton() {
  return (
    <div
      className="mt-8 grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start xl:gap-x-16 md:mt-10 animate-pulse"
      aria-busy="true"
    >
      <figure className="min-w-0">
        <div
          className="mx-auto aspect-4/3 w-full max-w-full rounded-xl border border-line/70 bg-soft"
          style={{ maxHeight: "min(72vh, calc(100vh - 12rem))" }}
        />
        <div className="mt-6 border-b border-line pb-6">
          <div className="h-9 w-2/3 rounded-lg bg-soft" />
          <div className="mt-3.5 h-4 w-5/6 rounded-md bg-soft" />
          <div className="mt-3 h-4 w-1/3 rounded-md bg-soft" />
        </div>
      </figure>
      <aside className="flex min-w-0 flex-col gap-10">
        <div className="rounded-2xl border border-line/60 bg-surface/75 p-5 shadow-xs">
          <div className="mb-4 h-4 w-16 rounded-md bg-soft" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-12 rounded-xl bg-soft" />
            <div className="h-12 rounded-xl bg-soft" />
            <div className="h-12 rounded-xl bg-soft" />
            <div className="h-12 rounded-xl bg-soft" />
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-line pt-8">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="h-11 rounded-xl bg-soft" />
            <div className="h-11 rounded-xl bg-soft" />
          </div>
          <div className="h-11 rounded-xl bg-soft" />
        </div>
      </aside>
    </div>
  );
}
export function SeriesDetailSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true">
      <SkeletonHeader />
      <div className="mx-auto max-w-5xl">
        <div className="aspect-16/10 w-full rounded-2xl border border-line/70 bg-soft shadow-xs" />
        <div className="mt-4 flex items-center justify-between">
          <div className="h-4 w-20 rounded-md bg-soft" />
          <div className="flex gap-2">
            <div className="h-8 w-8 rounded-full bg-soft" />
            <div className="h-8 w-8 rounded-full bg-soft" />
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
      <div className="mb-8 flex gap-2">
        <div className="h-9 w-20 rounded-full bg-soft" />
        <div className="h-9 w-20 rounded-full bg-soft" />
        <div className="h-9 w-20 rounded-full bg-soft" />
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
      className={`animate-pulse rounded-md bg-soft ${className}`}
      {...props}
    />
  );
}
