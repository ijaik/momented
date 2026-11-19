import type { Metadata } from "next";
import ToastProvider from "@/components/ui/ToastProvider";
import { verifyAdminSession } from "@/lib/auth/auth";
import {
  getAdminCalendarCollections,
  getAdminCollections,
  getAdminPhotos,
  getAdminRuleCollections,
  getAdminSeries,
} from "@/lib/db/admin";
import DashboardTabs from "./_components/DashboardTabs";
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};
export const instant = false;
export default async function AdminDashboard() {
  await verifyAdminSession();
  const [photos, collections, rules, calendars, series] = await Promise.all([
    getAdminPhotos(),
    getAdminCollections(),
    getAdminRuleCollections(),
    getAdminCalendarCollections(),
    getAdminSeries(),
  ]);
  return (
    <>
      <ToastProvider />
      <DashboardTabs
        photos={photos}
        collections={collections}
        rules={rules}
        calendars={calendars}
        series={series}
      />
    </>
  );
}
