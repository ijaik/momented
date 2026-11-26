import type { Photo } from "@/types";
export type WallSide = "right" | "left";
export interface CameraPose {
  s: number;
  lat: number;
  yaw: number;
  y: number;
  pitch: number;
}
export interface CorridorPoint {
  cx: number;
  cz: number;
  tx: number;
  tz: number;
  nx: number;
  nz: number;
}
export const CORRIDOR_HALF_W = 2.9;
export const H_WALL = 6.2;
export const PY = 1.95;
export const CURVE_AMP = 2.4;
export const CURVE_FREQ = 0.08;
export const FRAME_START_S = 3.8;
export const FRAME_STEP_S = 3.2;
export const CORRIDOR_START_S = -10.5;
export const END_WALL_PAD_S = 3.5;
export const END_STOP_OFFSET_S = 2.6;
/** Computes spine center, forward unit tangent T, and right-hand unit normal N in XZ. */
export function getCorridorPoint(s: number): CorridorPoint {
  const cx = CURVE_AMP * Math.sin(CURVE_FREQ * s);
  const cz = -s;
  const dx = CURVE_AMP * CURVE_FREQ * Math.cos(CURVE_FREQ * s);
  const dz = -1;
  const len = Math.hypot(dx, dz);
  const tx = dx / len;
  const tz = dz / len;
  // Right = T x Up = (-tz, 0, tx) so index 0 maps onto the right wall when walking forward (-Z).
  const nx = -tz;
  const nz = tx;
  return { cx, cz, tx, tz, nx, nz };
}
/** Alternates walls chronologically: 1st photo (0) on right, 2nd (1) on left, etc. */
export function getAlternatingSide(index: number): WallSide {
  return index % 2 === 0 ? "right" : "left";
}
export function getFrameAnchorS(index: number): number {
  return FRAME_START_S + index * FRAME_STEP_S;
}
export function getMaxWalkS(photoCount: number): number {
  if (photoCount <= 0) return 0;
  const lastFrameS = getFrameAnchorS(photoCount - 1);
  return Math.max(0, lastFrameS + END_WALL_PAD_S - END_STOP_OFFSET_S);
}
export function clampWalkS(s: number, maxWalkS: number, minWalkS = 0): number {
  return Math.min(maxWalkS, Math.max(minWalkS, s));
}
/** Scales frame dimensions in meters to preserve the photograph's natural aspect ratio. */
export function getPhotoDimensions(photo: Pick<Photo, "width" | "height">): {
  w: number;
  h: number;
} {
  const aspect =
    photo.width && photo.height ? photo.width / photo.height : 3 / 4;
  if (aspect >= 1) {
    const h = 1.25;
    const w = Math.min(2.2, h * aspect);
    return { w, h: w / aspect };
  }
  const h = 1.75;
  const w = h * aspect;
  if (w > 1.5) return { w: 1.5, h: 1.5 / aspect };
  return { w, h };
}
export function getWalkPoseForS(s: number, isPortrait: boolean): CameraPose {
  return {
    s,
    lat: 0,
    yaw: 0,
    y: isPortrait ? 1.88 : 1.92,
    pitch: -0.04,
  };
}
/** Scales vertical FOV on narrow viewports to preserve horizontal room without fisheye distortion. */
export function getWalkCameraFov(aspect: number): number {
  if (!Number.isFinite(aspect) || aspect >= 1) return 56;
  const targetHalfTanH = Math.tan((28 * Math.PI) / 180);
  const vFovRad = 2 * Math.atan(targetHalfTanH / Math.max(aspect, 0.35));
  return Math.min(86, Math.max(56, (vFovRad * 180) / Math.PI));
}
/** Sets the minimum backward walk position so narrow screens still see frames 1 and 2 at the entrance. */
export function getMinWalkS(aspect: number): number {
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 16 / 9;
  const vFov = getWalkCameraFov(safeAspect);
  const halfTanH = Math.tan(((vFov / 2) * Math.PI) / 180) * safeAspect;
  const requiredAhead = CORRIDOR_HALF_W / (0.78 * halfTanH);
  return Math.min(0, Math.max(-7.5, FRAME_START_S - 0.6 - requiredAhead));
}
export function getFocusPoseForFrame(
  s: number,
  side: WallSide,
  width: number,
  isPortrait: boolean,
): CameraPose {
  const dist = isPortrait
    ? Math.max(3.1, Math.min(4.0, width * 1.65))
    : Math.max(3.2, Math.min(4.4, width * 1.6));
  const lat =
    side === "right" ? CORRIDOR_HALF_W - dist : -(CORRIDOR_HALF_W - dist);
  const yaw = side === "right" ? Math.PI / 2 : -Math.PI / 2;
  return {
    s,
    lat,
    yaw,
    y: isPortrait ? PY - 0.15 : PY,
    pitch: 0,
  };
}
