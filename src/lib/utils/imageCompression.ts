import imageCompression from "browser-image-compression";

const fileToDataURL = (file: File | Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
function dataURLtoFile(
  dataurl: string,
  filename: string,
  mimeType: string,
): File {
  const commaIdx = dataurl.indexOf(",");
  const base64 = commaIdx >= 0 ? dataurl.slice(commaIdx + 1) : dataurl;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], filename, { type: mimeType });
}
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
      _compressionError,
    );
    try {
      options.preserveExif = false;
      const compressedWithoutExif = await imageCompression(file, options);
      if (file.type === "image/jpeg" || file.type === "image/jpg") {
        try {
          const { dump, insert, load } = await import("piexif-ts");
          const originalDataURL = await fileToDataURL(file);
          const exifObj = load(originalDataURL);
          if (exifObj?.["0th"] && 274 in exifObj["0th"]) {
            const rawOrientation = Number(exifObj["0th"][274]);
            if (
              Number.isInteger(rawOrientation) &&
              rawOrientation >= 1 &&
              rawOrientation <= 8
            ) {
              exifObj["0th"][274] = rawOrientation;
            } else {
              delete exifObj["0th"][274];
            }
          }
          const exifBytes = dump(exifObj);
          const compressedDataURL = await fileToDataURL(compressedWithoutExif);
          const finalDataURL = insert(exifBytes, compressedDataURL);
          return dataURLtoFile(finalDataURL, file.name, file.type);
        } catch (exifError) {
          console.warn(
            "Manual EXIF injection failed, using compressed image without EXIF:",
            exifError,
          );
          return compressedWithoutExif;
        }
      }
      return compressedWithoutExif;
    } catch (manualExifError) {
      console.warn(
        "Image compression failed, falling back to original file:",
        manualExifError,
      );
      return file;
    }
  }
}
