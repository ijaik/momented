export function toJpegUrl(imageUrl) {
  if (!imageUrl.includes("/upload/")) return imageUrl;
  const uploadIndex = imageUrl.indexOf("/upload/") + "/upload/".length;
  const rest = imageUrl.slice(uploadIndex);
  const segment = rest.match(/^[^/]*/)[0];
  const hasFlag = segment.split(",").some((p) => p.startsWith("f_"));
  if (!hasFlag) {
    return `${imageUrl.slice(0, uploadIndex)}f_jpg/${rest}`;
  }
  return `${imageUrl.slice(0, uploadIndex)}${segment.replace(/f_[a-z0-9_]+/, "f_jpg")}${rest.slice(segment.length)}`;
}
export async function imageUrlToFile(imageUrl) {
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
    const blob = await new Promise((resolve) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext("2d").drawImage(img, 0, 0);
        canvas.toBlob((b) => resolve(b || null), "image/jpeg", 0.92);
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
export async function copyText(text) {
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
