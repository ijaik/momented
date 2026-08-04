import { getPhotoDate } from "@/lib/dateUtils";
export const formatCalendarCollections = (calendarData, allPhotos) => {
  return (
    calendarData?.map((month) => {
      const monthPhotos =
        allPhotos?.filter((p) => getPhotoDate(p).month === month.id) || [];
      const customCover = allPhotos?.find((p) => p.id === month.cover_photo_id);
      const primaryCover = customCover || monthPhotos[0];
      let sortedPhotos = [...monthPhotos];
      if (primaryCover && sortedPhotos.some((p) => p.id === primaryCover.id)) {
        sortedPhotos = [
          primaryCover,
          ...sortedPhotos.filter((p) => p.id !== primaryCover.id),
        ];
      } else if (primaryCover) {
        sortedPhotos = [primaryCover, ...sortedPhotos];
      }
      return {
        ...month,
        id: month.id.toString(),
        photos: sortedPhotos.map((p) => ({
          id: p.id,
          cloudinary_url: p.cloudinary_url,
        })),
      };
    }) || []
  );
};
