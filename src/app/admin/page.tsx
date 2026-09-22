import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCalendarCollectionsAction } from "@/actions/calendar";
import {
  getCollectionsAction,
  getRuleCollectionsAction,
} from "@/actions/collections";
import { getPhotosAction } from "@/actions/photos";
import { getStoriesAction } from "@/actions/stories";
import { isAdminAuthed } from "@/lib/auth/auth";
import DashboardTabs from "./_components/DashboardTabs";
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};
export const instant = false;
export default async function AdminDashboard() {
  if (!(await isAdminAuthed())) redirect("/admin/login");
  const [photos, collections, rules, stories, calendars] = await Promise.all([
    getPhotosAction(),
    getCollectionsAction(),
    getRuleCollectionsAction(),
    getStoriesAction(),
    getCalendarCollectionsAction(),
  ]);
  return (
    <DashboardTabs
      photos={photos}
      collections={collections}
      rules={rules}
      stories={stories}
      calendars={calendars}
    />
  );
}
