import {
  getCollectionsAction,
  getPhotosAction,
  getStoriesAction,
} from "@/app/actions/admin";
import DashboardTabs from "./_components/DashboardTabs";
export const dynamic = "force-dynamic";
export default async function AdminDashboard() {
  const [photos, collections, stories] = await Promise.all([
    getPhotosAction(),
    getCollectionsAction(),
    getStoriesAction(),
  ]);
  return (
    <DashboardTabs
      photos={photos}
      collections={collections}
      stories={stories}
    />
  );
}
