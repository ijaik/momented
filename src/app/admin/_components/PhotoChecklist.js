"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
export default function PhotoChecklist({
  photos,
  linkedPhotos = [],
  initialCoverId = null,
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [coverId, setCoverId] = useState(initialCoverId);
  useEffect(() => {
    setSelectedIds(linkedPhotos.map((p) => p.id));
    setCoverId(initialCoverId || linkedPhotos[0]?.id || null);
  }, [linkedPhotos, initialCoverId]);
  const handleCheckboxChange = (photoId, isChecked) => {
    if (isChecked) {
      setSelectedIds((prev) => [...prev, photoId]);
      if (!coverId) setCoverId(photoId);
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== photoId));
      if (coverId === photoId) {
        setCoverId(selectedIds.find((id) => id !== photoId) || null);
      }
    }
  };
  return (
    <div className="flex flex-col gap-2 mt-4">
      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        Select Photos & Choose Cover
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-80 overflow-y-auto border border-zinc-300 dark:border-zinc-700 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
        {photos.map((p) => {
          const isChecked = selectedIds.includes(p.id);
          const isCover = coverId === p.id;
          return (
            <div
              key={p.id}
              className={`flex flex-col gap-2 p-2 rounded-xl border transition-all ${
                isCover
                  ? "border-blue-500 bg-blue-50/30 dark:bg-blue-950/10"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <label className="relative aspect-square w-full rounded-md overflow-hidden bg-zinc-200 dark:bg-zinc-800 border-2 border-transparent cursor-pointer block group">
                <Image
                  src={p.cloudinary_url}
                  alt={p.title}
                  fill
                  className="object-cover"
                  sizes="150px"
                />
                <input
                  type="checkbox"
                  name="photo_ids"
                  value={p.id}
                  checked={isChecked}
                  onChange={(e) => handleCheckboxChange(p.id, e.target.checked)}
                  className="absolute top-2 left-2 w-4 h-4 z-10 cursor-pointer shadow-sm"
                />
              </label>
              <div className="flex flex-col gap-1 px-1">
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">
                  {p.title}
                </span>
                {isChecked && (
                  <label className="flex items-center gap-1.5 cursor-pointer mt-1">
                    <input
                      type="radio"
                      name="cover_photo_id"
                      value={p.id}
                      checked={isCover}
                      onChange={() => setCoverId(p.id)}
                      className="w-3.5 h-3.5 text-blue-600 cursor-pointer"
                    />
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        isCover
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-zinc-400"
                      }`}
                    >
                      {isCover ? "Cover Photo" : "Set Cover"}
                    </span>
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
