"use client";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/app/actions/auth";
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
  const tabs: TabType[] = [
    "photos",
    "collections",
    "rules",
    "calendar",
    "stories",
  ];
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black font-sans p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 mb-10 pb-4 overflow-x-auto">
          <div className="flex gap-4">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-lg font-bold capitalize px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-900"
                }`}
              >
                Manage {tab}
              </button>
            ))}
          </div>
          <Button
            type="button"
            variant="danger"
            onClick={handleLogout}
            className="font-bold shrink-0 ml-4"
          >
            Logout
          </Button>
        </div>
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
