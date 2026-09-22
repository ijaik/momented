const TRANSFORM_OPS = new Set([
  "a",
  "ar",
  "b",
  "c",
  "cs",
  "d",
  "dpr",
  "e",
  "f",
  "fl",
  "g",
  "h",
  "if",
  "l",
  "o",
  "q",
  "r",
  "t",
  "u",
  "w",
  "x",
  "y",
]);
function isTransformSegment(segment: string): boolean {
  if (!segment) return false;
  if (segment.includes(",")) return true;
  const match = /^([a-z]+)_(.+)$/.exec(segment);
  return Boolean(match && TRANSFORM_OPS.has(match[1]));
}
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
  const [firstSegment, ...restSegments] = suffix.split("/");
  if (isTransformSegment(firstSegment))
    return `${prefix}${firstSegment}/${transformString}/${restSegments.join("/")}`;
  return `${prefix}${transformString}/${suffix}`;
}
export function getSocialShareImageUrl(url: string): string {
  return buildCloudinaryUrl(url, ["t_social_share"]);
}
