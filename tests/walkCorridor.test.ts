import { describe, expect, it } from "bun:test";
import {
  CORRIDOR_HALF_W,
  clampWalkS,
  FRAME_START_S,
  FRAME_STEP_S,
  getAlternatingSide,
  getCorridorPoint,
  getFocusPoseForFrame,
  getFrameAnchorS,
  getMaxWalkS,
  getMinWalkS,
  getPhotoDimensions,
  getWalkCameraFov,
  getWalkPoseForS,
} from "@/app/walk/corridor";

describe("Walk Corridor Geometry & Finite Boundaries", () => {
  it("alternates walls starting with 1st photo on right then 2nd on left", () => {
    expect(getAlternatingSide(0)).toBe("right");
    expect(getAlternatingSide(1)).toBe("left");
    expect(getAlternatingSide(2)).toBe("right");
    expect(getAlternatingSide(3)).toBe("left");
    expect(getFrameAnchorS(0)).toBe(FRAME_START_S);
    expect(getFrameAnchorS(2)).toBe(FRAME_START_S + 2 * FRAME_STEP_S);
  });
  it("produces orthogonal unit tangent and right-hand normal vectors along the curve", () => {
    for (const s of [0, 10, 35, 80]) {
      const pt = getCorridorPoint(s);
      const tMag = Math.hypot(pt.tx, pt.tz);
      const nMag = Math.hypot(pt.nx, pt.nz);
      const dot = pt.tx * pt.nx + pt.tz * pt.nz;
      expect(tMag).toBeCloseTo(1, 6);
      expect(nMag).toBeCloseTo(1, 6);
      expect(dot).toBeCloseTo(0, 6);
      expect(pt.tz).toBeLessThan(0);
    }
  });
  it("clamps movement between entrance (0) and finite gallery end", () => {
    const maxSFinite = getMaxWalkS(50);
    expect(clampWalkS(-10, maxSFinite)).toBe(0);
    expect(clampWalkS(9999, maxSFinite)).toBe(maxSFinite);
    expect(maxSFinite).toBeGreaterThan(getFrameAnchorS(49));
  });
  it("preserves exact photo aspect ratio and points focus pose at the targeted wall", () => {
    const dims = getPhotoDimensions({ width: 1920, height: 1080 });
    expect(dims.w / dims.h).toBeCloseTo(16 / 9, 4);
    const tallDims = getPhotoDimensions({ width: 1900, height: 2000 });
    expect(tallDims.w).toBeLessThanOrEqual(1.5);
    expect(tallDims.w / tallDims.h).toBeCloseTo(1900 / 2000, 4);
    const rightFocus = getFocusPoseForFrame(3.8, "right", dims.w, false);
    const leftFocus = getFocusPoseForFrame(7.0, "left", dims.w, false);
    const walk = getWalkPoseForS(0, false);
    const portraitWalk = getWalkPoseForS(5, true);
    expect(getMaxWalkS(0)).toBe(0);
    expect(rightFocus.yaw).toBeCloseTo(Math.PI / 2, 5);
    expect(leftFocus.yaw).toBeCloseTo(-Math.PI / 2, 5);
    expect(rightFocus.lat).toBeLessThan(0);
    expect(leftFocus.lat).toBeGreaterThan(0);
    expect(walk.yaw).toBe(0);
    expect(portraitWalk.y).toBe(1.88);
  });
  it("widens narrow portrait FOV and sets entrance setback so 1st and 2nd photos stay inside view", () => {
    expect(getWalkCameraFov(16 / 9)).toBe(56);
    expect(getWalkCameraFov(375 / 812)).toBe(86);
    expect(getWalkCameraFov(0.75)).toBeGreaterThan(56);
    expect(getWalkCameraFov(Number.NaN)).toBe(56);
    const mobileAspect = 375 / 812;
    const minS = getMinWalkS(mobileAspect);
    expect(minS).toBeLessThan(0);
    expect(clampWalkS(-99, 50, minS)).toBe(minS);
    const startS = minS + 0.6;
    const camPt = getCorridorPoint(startS);
    const halfTanH =
      Math.tan(((getWalkCameraFov(mobileAspect) / 2) * Math.PI) / 180) *
      mobileAspect;
    for (const index of [0, 1] as const) {
      const sideSign = getAlternatingSide(index) === "right" ? 1 : -1;
      const framePt = getCorridorPoint(getFrameAnchorS(index));
      const frameX =
        framePt.cx + sideSign * (CORRIDOR_HALF_W - 0.04) * framePt.nx;
      const frameZ =
        framePt.cz + sideSign * (CORRIDOR_HALF_W - 0.04) * framePt.nz;
      const dx = frameX - camPt.cx;
      const dz = frameZ - camPt.cz;
      const depth = dx * camPt.tx + dz * camPt.tz;
      const rightOffset = dx * camPt.nx + dz * camPt.nz;
      expect(depth).toBeGreaterThan(0);
      expect(Math.abs(rightOffset) / depth).toBeLessThan(halfTanH);
    }
  });
});
