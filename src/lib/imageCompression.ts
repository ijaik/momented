import imageCompression from "browser-image-compression";
import { dump, insert, load } from "piexif-ts";

const fileToDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
const dataURLtoFile = (
  dataurl: string,
  filename: string,
  mimeType: string,
): File => {
  const arr = dataurl.split(",");
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mimeType });
};
export async function compressImageWithExif(
  file: File,
  onStatusChange?: (status: string) => void,
): Promise<File> {
  if (file.size <= 10 * 1024 * 1024) {
    return file;
  }
  onStatusChange?.("Compressing large photo...");
  const options = {
    maxSizeMB: 10,
    maxWidthOrHeight: 7680,
    useWebWorker: true,
    preserveExif: true,
  };
  try {
    return await imageCompression(file, options);
  } catch (_compressionError) {
    console.warn(
      "Native EXIF preservation failed, attempting manual EXIF injection...",
    );
    try {
      options.preserveExif = false;
      const compressedWithoutExif = await imageCompression(file, options);
      if (file.type === "image/jpeg" || file.type === "image/jpg") {
        const originalDataURL = await fileToDataURL(file);
        const exifObj = load(originalDataURL);
        const exifBytes = dump(exifObj);
        const compressedDataURL = await fileToDataURL(compressedWithoutExif);
        const finalDataURL = insert(exifBytes, compressedDataURL);
        return dataURLtoFile(finalDataURL, file.name, file.type);
      }
      return compressedWithoutExif;
    } catch (manualExifError) {
      console.error("Manual EXIF preservation failed:", manualExifError);
      throw new Error("Failed to compress image and preserve EXIF data.");
    }
  }
}
