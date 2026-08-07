import {
  getCalendarCollectionsAction,
  getCollectionsAction,
  getPhotosAction,
  getRuleCollectionsAction,
  getStoriesAction,
} from "@/app/actions/admin";
import DashboardTabs from "./_components/DashboardTabs";
export const dynamic = "force-dynamic";
export default async function AdminDashboard() {
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
