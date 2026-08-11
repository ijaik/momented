export function buildCloudinaryUrl(
  url: string,
  transformations: string[] = [],
): string {
  if (!url || typeof url !== "string") return "";
  if (!url.includes("res.cloudinary.com")) return url;
  if (transformations.length === 0) return url;
  const transformString = transformations.join(",");
  const uploadIndex = url.indexOf("/upload/");
  if (uploadIndex === -1) return url;
  const prefix = url.substring(0, uploadIndex + 8);
  const suffix = url.substring(uploadIndex + 8);
  return `${prefix}${transformString}/${suffix}`;
}
export function getSocialShareImageUrl(url: string): string {
  return buildCloudinaryUrl(url, ["t_social_share"]);
}
