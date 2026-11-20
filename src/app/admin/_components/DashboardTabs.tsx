"use client";
import { Activity, type KeyboardEvent, useState } from "react";
import { logoutAction, logoutAllAction } from "@/actions/auth";
import BrandLogo from "@/components/ui/BrandLogo";
import Button from "@/components/ui/Button";
import CalendarManager, { type CalendarItem } from "./CalendarManager";
import CollectionManager from "./CollectionManager";
import type { BaseItem } from "./ItemManager";
import PhotoManager, { type PhotoItem } from "./PhotoManager";
import RuleManager from "./RuleManager";
import SeriesManager, { type SeriesAdminItem } from "./SeriesManager";

type TabType = "photos" | "collections" | "rules" | "calendar" | "series";
const TAB_ORDER: TabType[] = [
  "photos",
  "collections",
  "rules",
  "calendar",
  "series",
];
const TAB_LABELS: Record<TabType, string> = {
  photos: "Photographs",
  collections: "Collections",
  rules: "Rules",
  calendar: "Calendar",
  series: "Series",
};
interface DashboardTabsProps {
  photos: PhotoItem[];
  collections: BaseItem[];
  rules: BaseItem[];
  calendars: CalendarItem[];
  series: SeriesAdminItem[];
}
export default function DashboardTabs({
  photos,
  collections,
  rules,
  calendars,
  series,
}: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("photos");
  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>, tab: TabType) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (dir === 0) return;
    e.preventDefault();
    const currentIndex = TAB_ORDER.indexOf(tab);
    const next =
      TAB_ORDER[(currentIndex + dir + TAB_ORDER.length) % TAB_ORDER.length];
    setActiveTab(next);
    document.getElementById(`tab-${next}`)?.focus({ preventScroll: true });
  };
  return (
    <main className="mx-auto w-full max-w-360 px-5 py-12 sm:px-8 lg:px-12 md:py-16">
      <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-4 border-b border-line/70 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <BrandLogo />
            <span className="editorial-label text-muted px-2.5 py-0.5 rounded-full border border-line/80 bg-soft/80 font-medium">
              Studio
            </span>
          </div>
          <p className="mt-1.5 text-xs text-muted">
            Curatorial editorial workspace
          </p>
        </div>
        <div className="flex items-center gap-2">
          <form action={logoutAction}>
            <Button variant="secondary" size="sm" type="submit">
              Log out
            </Button>
          </form>
          <form action={logoutAllAction}>
            <Button
              variant="ghost"
              size="sm"
              type="submit"
              className="text-xs text-muted hover:text-ink cursor-pointer"
              title="Invalidates all sessions across all devices"
            >
              Log out all devices
            </Button>
          </form>
        </div>
      </header>
      <div
        role="tablist"
        aria-label="Content to manage"
        className="mt-8 flex items-center justify-start overflow-x-auto pb-2"
      >
        <div className="inline-flex items-center gap-1.5 rounded-full border border-line/80 bg-soft/70 p-1.5 backdrop-blur-md shadow-2xs">
          {TAB_ORDER.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                id={`tab-${tab}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(tab)}
                onKeyDown={(e) => onTabKeyDown(e, tab)}
                className={`rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors duration-150 ease-out whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-surface text-ink shadow-xs font-semibold"
                    : "text-muted hover:text-ink hover:bg-surface/50"
                }`}
              >
                {TAB_LABELS[tab]}
              </button>
            );
          })}
        </div>
      </div>
      <div className="pt-10">
        <div
          id="panel-photos"
          role="tabpanel"
          aria-labelledby="tab-photos"
          hidden={activeTab !== "photos"}
        >
          <Activity mode={activeTab === "photos" ? "visible" : "hidden"}>
            <PhotoManager
              photos={photos}
              collections={collections}
              rules={rules}
            />
          </Activity>
        </div>
        <div
          id="panel-collections"
          role="tabpanel"
          aria-labelledby="tab-collections"
          hidden={activeTab !== "collections"}
        >
          <Activity mode={activeTab === "collections" ? "visible" : "hidden"}>
            <CollectionManager collections={collections} allPhotos={photos} />
          </Activity>
        </div>
        <div
          id="panel-rules"
          role="tabpanel"
          aria-labelledby="tab-rules"
          hidden={activeTab !== "rules"}
        >
          <Activity mode={activeTab === "rules" ? "visible" : "hidden"}>
            <RuleManager rules={rules} allPhotos={photos} />
          </Activity>
        </div>
        <div
          id="panel-calendar"
          role="tabpanel"
          aria-labelledby="tab-calendar"
          hidden={activeTab !== "calendar"}
        >
          <Activity mode={activeTab === "calendar" ? "visible" : "hidden"}>
            <CalendarManager calendars={calendars} allPhotos={photos} />
          </Activity>
        </div>
        <div
          id="panel-series"
          role="tabpanel"
          aria-labelledby="tab-series"
          hidden={activeTab !== "series"}
        >
          <Activity mode={activeTab === "series" ? "visible" : "hidden"}>
            <SeriesManager series={series} allPhotos={photos} />
          </Activity>
        </div>
      </div>
    </main>
  );
}
