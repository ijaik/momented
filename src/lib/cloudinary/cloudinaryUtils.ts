const TRANSFORM_PATTERN =
  /^(?:[a-z]{1,3}_(?:auto|\d+|[a-z0-9_-]+:[a-z0-9_-]+)|c_(?:fill|limit|fit|scale|crop|thumb|pad|auto)|f_(?:auto|jpg|jpeg|png|webp|avif)|q_(?:auto|\d+)|fl_[a-z0-9_]+|t_[a-z0-9_-]+|[wh]_\d+)$/i;
function isTransformSegment(segment: string): boolean {
  if (!segment) return false;
  if (segment.includes(",")) return true;
  return TRANSFORM_PATTERN.test(segment);
}
export function buildCloudinaryUrl(
  url: string | null | undefined,
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
  const [firstSegment, ...restSegments] = suffix.split("/");
  if (isTransformSegment(firstSegment))
    return `${prefix}${firstSegment}/${transformString}/${restSegments.join("/")}`;
  return `${prefix}${transformString}/${suffix}`;
}
export function getSocialShareImageUrl(url: string): string {
  return buildCloudinaryUrl(url, ["t_social_share"]);
}
export function formatDownloadFilename(
  baseTitle: string | null | undefined,
  suffix = "",
): string {
  const slug = (baseTitle || "A-Momented-Photograph")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  return `${slug}${suffix}.jpg`;
}
