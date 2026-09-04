"use client";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { type KeyboardEvent, useState } from "react";
import { logoutAction } from "@/actions/auth";
import Button from "@/components/ui/Button";
import type { CalendarItem } from "./CalendarManager";
import type { BaseItem } from "./ItemManager";
import type { PhotoItem } from "./PhotoManager";

const PhotoManager = dynamic(() => import("./PhotoManager"));
const CollectionManager = dynamic(() => import("./CollectionManager"));
const RuleManager = dynamic(() => import("./RuleManager"));
const StoryManager = dynamic(() => import("./StoryManager"));
const CalendarManager = dynamic(() => import("./CalendarManager"));
type TabType = "photos" | "collections" | "rules" | "calendar" | "stories";
const TAB_ORDER: TabType[] = [
  "photos",
  "collections",
  "rules",
  "calendar",
  "stories",
];
const TAB_LABELS: Record<TabType, string> = {
  photos: "Photographs",
  collections: "Collections",
  rules: "Rules",
  calendar: "Calendar",
  stories: "Stories",
};
interface DashboardTabsProps {
  photos: PhotoItem[];
  collections: BaseItem[];
  rules: BaseItem[];
  stories: BaseItem[];
  calendars: CalendarItem[];
}
export default function DashboardTabs({
  photos,
  collections,
  rules,
  stories,
  calendars,
}: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("photos");
  const router = useRouter();
  async function handleLogout() {
    await logoutAction();
    router.push("/");
  }
  const activate = (tab: TabType) => setActiveTab(tab);
  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>, tab: TabType) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (dir === 0) return;
    e.preventDefault();
    const currentIndex = TAB_ORDER.indexOf(tab);
    const next =
      TAB_ORDER[(currentIndex + dir + TAB_ORDER.length) % TAB_ORDER.length];
    activate(next);
    document.getElementById(`tab-${next}`)?.focus();
  };
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 md:py-16">
      <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-4 border-b border-line pb-6">
        <div>
          <p className="font-script text-2xl leading-none tracking-tight text-ink">
            Momented
          </p>
          <p className="mt-2 text-sm text-muted">Content studio</p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} type="button">
          Log out
        </Button>
      </header>
      <div
        role="tablist"
        aria-label="Content to manage"
        className="mt-8 flex gap-7 overflow-x-auto overflow-y-hidden border-b border-line"
      >
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
              onClick={() => activate(tab)}
              onKeyDown={(e) => onTabKeyDown(e, tab)}
              className={`relative -mb-px whitespace-nowrap border-b-2 py-3 text-sm transition-colors ${
                isActive
                  ? "border-ink font-medium text-ink"
                  : "border-transparent text-muted hover:border-ink/30 hover:text-ink"
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          );
        })}
      </div>
      <div
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="pt-10"
      >
        {activeTab === "photos" && (
          <PhotoManager
            photos={photos}
            collections={collections}
            rules={rules}
            stories={stories}
          />
        )}
        {activeTab === "collections" && (
          <CollectionManager collections={collections} allPhotos={photos} />
        )}
        {activeTab === "rules" && (
          <RuleManager rules={rules} allPhotos={photos} />
        )}
        {activeTab === "calendar" && (
          <CalendarManager calendars={calendars} allPhotos={photos} />
        )}
        {activeTab === "stories" && (
          <StoryManager stories={stories} allPhotos={photos} />
        )}
      </div>
    </main>
  );
}
