import type { Metadata } from "next";
import { getCalendarCollectionsAction } from "@/actions/calendar";
import {
  getCollectionsAction,
  getRuleCollectionsAction,
} from "@/actions/collections";
import { getPhotosAction } from "@/actions/photos";
import { getSeriesAction } from "@/actions/series";
import DashboardTabs from "./_components/DashboardTabs";
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};
export const instant = false;
export default async function AdminDashboard() {
  const [photos, collections, rules, calendars, series] = await Promise.all([
    getPhotosAction(),
    getCollectionsAction(),
    getRuleCollectionsAction(),
    getCalendarCollectionsAction(),
    getSeriesAction(),
  ]);
  return (
    <DashboardTabs
      photos={photos}
      collections={collections}
      rules={rules}
      calendars={calendars}
      series={series}
    />
  );
}
