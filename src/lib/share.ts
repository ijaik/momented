export function toJpegUrl(imageUrl: string): string {
  if (!imageUrl.includes("/upload/")) return imageUrl;
  const parts = imageUrl.split("/upload/");
  const base = `${parts[0]}/upload/`;
  let rest = parts[1];
  const firstSegment = rest.split("/")[0];
  if (
    firstSegment.includes(",") ||
    firstSegment.startsWith("f_") ||
    firstSegment.startsWith("c_")
  ) {
    rest = rest.substring(firstSegment.length + 1);
  }
  return `${base}c_limit,w_1600,q_auto,f_jpg/${rest}`;
}
export async function imageUrlToFile(imageUrl: string): Promise<File | null> {
  const jpegUrl = toJpegUrl(imageUrl);
  try {
    const response = await fetch(jpegUrl);
    if (!response.ok)
      throw new Error(`Fetch failed with status ${response.status}`);
    const blob = await response.blob();
    if (!blob.type.startsWith("image/")) throw new Error("Not an image");
    return new File([blob], "momented-photo.jpg", {
      type: blob.type || "image/jpeg",
    });
  } catch (error) {
    console.warn("Primary fetch failed, attempting canvas fallback:", error);
    const blob = await new Promise<Blob | null>((resolve) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((b) => resolve(b || null), "image/jpeg", 0.92);
        } else {
          resolve(null);
        }
      };
      img.onerror = (e) => {
        console.error("Canvas image load failed", e);
        resolve(null);
      };
      img.src = jpegUrl;
    });
    if (!blob) return null;
    return new File([blob], "momented-photo.jpg", { type: "image/jpeg" });
  }
}
export async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  try {
    textarea.select();
    if (!document.execCommand("copy")) throw new Error("Copy failed");
  } finally {
    document.body.removeChild(textarea);
  }
}
