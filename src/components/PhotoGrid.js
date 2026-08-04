import PhotoCard from "@/components/PhotoCard";
export default function PhotoGrid({
  photos,
  emptyMessage = "No photos uploaded yet.",
}) {
  if (!photos || photos.length === 0) {
    return (
      <div className="text-center text-zinc-500 py-20 border-t border-zinc-200 dark:border-zinc-800">
        {emptyMessage}
      </div>
    );
  }
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6 pb-24">
      {photos.map((photo, index) => (
        <PhotoCard key={photo.id} photo={photo} index={index} />
      ))}
    </div>
  );
}
