"use client";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/app/actions/auth";
const PhotoManager = dynamic(() => import("./PhotoManager"), {
  loading: () => (
    <p className="font-medium p-6 text-zinc-500">Loading Photos...</p>
  ),
});
const CollectionManager = dynamic(() => import("./CollectionManager"), {
  loading: () => (
    <p className="font-medium p-6 text-zinc-500">Loading Collections...</p>
  ),
});
const StoryManager = dynamic(() => import("./StoryManager"), {
  loading: () => (
    <p className="font-medium p-6 text-zinc-500">Loading Stories...</p>
  ),
});
export default function DashboardTabs({ photos, collections, stories }) {
  const [activeTab, setActiveTab] = useState("photos");
  const router = useRouter();
  async function handleLogout() {
    await logoutAction();
    router.push("/");
  }
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black font-sans p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 mb-10 pb-4 overflow-x-auto">
          <div className="flex gap-4">
            {["photos", "collections", "stories"].map((tab) => (
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
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm font-bold text-red-600 dark:text-red-400 px-5 py-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors shrink-0 ml-4"
          >
            Logout
          </button>
        </div>
        {activeTab === "photos" && (
          <PhotoManager
            photos={photos}
            collections={collections}
            stories={stories}
          />
        )}
        {activeTab === "collections" && (
          <CollectionManager collections={collections} allPhotos={photos} />
        )}
        {activeTab === "stories" && (
          <StoryManager stories={stories} allPhotos={photos} />
        )}
      </div>
    </main>
  );
}
