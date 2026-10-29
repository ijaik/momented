"use client";
import { useId, useState } from "react";
import PhotoGrid from "@/components/photos/PhotoGrid";
import type { Photo } from "@/types";
export interface YearGroup {
  year: number;
  photos: Photo[];
}
interface CalendarMonthViewProps {
  collectionTitle: string;
  structuredYears: YearGroup[];
  undatedPhotos: Photo[];
}
export default function CalendarMonthView({
  collectionTitle,
  structuredYears,
  undatedPhotos,
}: CalendarMonthViewProps) {
  const tabListId = useId();
  const yearTabs = structuredYears.map((group) => ({
    key: String(group.year),
    label: String(group.year),
    count: group.photos.length,
  }));
  const totalPhotos =
    structuredYears.reduce((sum, g) => sum + g.photos.length, 0) +
    undatedPhotos.length;
  const hasMultipleCategories =
    (structuredYears.length > 0 && undatedPhotos.length > 0) ||
    structuredYears.length > 1;
  const tabs: { key: string; label: string; count: number }[] = [];
  if (hasMultipleCategories) {
    tabs.push({
      key: "all",
      label: "All",
      count: totalPhotos,
    });
    tabs.push(...yearTabs);
    if (undatedPhotos.length > 0) {
      tabs.push({
        key: "lost",
        label: "I lost it 😭",
        count: undatedPhotos.length,
      });
    }
  }
  const validTabKeys = new Set(tabs.map((t) => t.key));
  const defaultTab =
    structuredYears.length === 0 && undatedPhotos.length > 0 ? "lost" : "all";
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      const paramTab = new URLSearchParams(window.location.search).get("tab");
      if (paramTab && validTabKeys.has(paramTab)) return paramTab;
    }
    return defaultTab;
  });
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (key === "all") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", key);
      }
      window.history.replaceState(null, "", url.toString());
    }
  };
  const selectedYearGroup = structuredYears.find(
    (g) => String(g.year) === activeTab,
  );
  return (
    <div className="flex flex-col">
      {tabs.length > 0 && (
        <div
          role="tablist"
          aria-label={`Filter ${collectionTitle} photographs by year`}
          className="mb-10 -mt-2 flex gap-6 overflow-x-auto overflow-y-hidden border-b border-line"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                id={`${tabListId}-tab-${tab.key}`}
                aria-selected={isActive}
                aria-controls={`${tabListId}-panel-${tab.key}`}
                onClick={() => handleTabChange(tab.key)}
                className={`relative whitespace-nowrap pb-3 text-sm font-medium transition-all duration-100 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink ${
                  isActive
                    ? "text-ink after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-ink"
                    : "text-muted hover:text-ink"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`ml-1.5 text-xs tabular-nums transition-colors ${
                    isActive ? "text-ink font-semibold" : "text-muted/70"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      )}
      <div
        role="tabpanel"
        id={`${tabListId}-panel-${activeTab}`}
        aria-labelledby={`${tabListId}-tab-${activeTab}`}
      >
        {activeTab === "all" && (
          <div className="flex flex-col gap-16 sm:gap-20">
            {structuredYears.map(({ year, photos }) => (
              <section key={year}>
                <h2 className="mb-8 border-b border-line pb-3 text-sm font-medium text-muted">
                  {year} · {photos.length}{" "}
                  {photos.length === 1 ? "photograph" : "photographs"}
                </h2>
                <PhotoGrid photos={photos} />
              </section>
            ))}
            {undatedPhotos.length > 0 && (
              <section key="undated-section">
                <div className="mb-8 flex flex-col gap-1.5 border-b border-line pb-3 sm:flex-row sm:items-baseline sm:justify-between">
                  <h2 className="text-sm font-medium text-ink flex items-center gap-2">
                    <span>I lost it 😭</span>
                    <span className="text-muted">·</span>
                    <span className="text-muted font-normal">
                      {undatedPhotos.length}{" "}
                      {undatedPhotos.length === 1
                        ? "photograph"
                        : "photographs"}
                    </span>
                  </h2>
                  <span className="text-xs text-muted">
                    EXIF capture date unavailable
                  </span>
                </div>
                <PhotoGrid photos={undatedPhotos} />
              </section>
            )}
          </div>
        )}
        {selectedYearGroup && (
          <section key={selectedYearGroup.year}>
            <h2 className="mb-8 border-b border-line pb-3 text-sm font-medium text-muted">
              {selectedYearGroup.year} · {selectedYearGroup.photos.length}{" "}
              {selectedYearGroup.photos.length === 1
                ? "photograph"
                : "photographs"}
            </h2>
            <PhotoGrid photos={selectedYearGroup.photos} />
          </section>
        )}
        {activeTab === "lost" && (
          <section key="undated-tab">
            <div className="mb-8 rounded-lg border border-line bg-surface/80 p-4 sm:p-5 shadow-xs backdrop-blur-xs">
              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <h2 className="text-base font-serif font-medium text-ink flex items-center gap-2">
                    <span>I lost it 😭</span>
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-muted">
                    These photographs don&apos;t have EXIF capture timestamps
                    preserved, so they couldn&apos;t be placed into a specific
                    year.
                  </p>
                </div>
                <span className="shrink-0 text-xs font-medium tabular-nums text-muted self-start sm:self-auto">
                  {undatedPhotos.length}{" "}
                  {undatedPhotos.length === 1 ? "photograph" : "photographs"}
                </span>
              </div>
            </div>
            <PhotoGrid photos={undatedPhotos} />
          </section>
        )}
      </div>
    </div>
  );
}
