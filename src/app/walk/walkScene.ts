"use client";
import * as THREE from "three";
import { buildCloudinaryUrl } from "@/lib/cloudinary/cloudinaryUtils";
import { formatDisplayDate } from "@/lib/utils/dateUtils";
import type { Photo } from "@/types";
import {
  type CameraPose,
  CORRIDOR_HALF_W,
  CORRIDOR_START_S,
  clampWalkS,
  END_WALL_PAD_S,
  getAlternatingSide,
  getCorridorPoint,
  getFocusPoseForFrame,
  getFrameAnchorS,
  getMaxWalkS,
  getMinWalkS,
  getPhotoDimensions,
  getWalkCameraFov,
  getWalkPoseForS,
  H_WALL,
  PY,
  type WallSide,
} from "./corridor";

const LABEL_CANVAS_W = 640;
const LABEL_CANVAS_H = 260;
const LABEL_PAD_X = 24;
const LABEL_MAX_TEXT_W = LABEL_CANVAS_W - LABEL_PAD_X * 2;
const TEXTURE_LOAD_BEHIND_S = 24;
const TEXTURE_LOAD_AHEAD_S = 36;
const TEXTURE_UNLOAD_BEHIND_S = 36;
const TEXTURE_UNLOAD_AHEAD_S = 48;
interface FrameEntry {
  index: number;
  photo: Photo;
  side: WallSide;
  s: number;
  w: number;
  url: string;
  printMat: THREE.MeshBasicMaterial;
  texState: "unloaded" | "loading" | "loaded" | "error";
  tex: THREE.Texture | null;
}
type WalkMode =
  | { kind: "intro"; startTime: number }
  | { kind: "walk" }
  | { kind: "focus"; index: number };
function createGradientTexture(
  width: number,
  height: number,
  vertical: boolean,
  stops: { stop: number; color: string }[],
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const grad = vertical
      ? ctx.createLinearGradient(0, 0, 0, height)
      : ctx.createLinearGradient(0, 0, width, 0);
    for (const s of stops) grad.addColorStop(s.stop, s.color);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
function fitCanvasText(
  ctx: CanvasRenderingContext2D,
  raw: string,
  maxWidth: number,
): string {
  const clean = raw.replace(/\s+/g, " ").trim();
  if (!clean || ctx.measureText(clean).width <= maxWidth) return clean;
  let lo = 0;
  let hi = clean.length;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (ctx.measureText(`${clean.slice(0, mid).trimEnd()}…`).width <= maxWidth)
      lo = mid;
    else hi = mid - 1;
  }
  const prefix = clean.slice(0, lo).trimEnd();
  return prefix ? `${prefix}…` : "";
}
function drawLabelCanvas(
  ctx: CanvasRenderingContext2D,
  photo: Photo,
  isDark: boolean,
) {
  ctx.clearRect(0, 0, LABEL_CANVAS_W, LABEL_CANVAS_H);
  ctx.font = "italic 400 44px serif";
  ctx.fillStyle = isDark ? "#F5F5F5" : "#111111";
  const titleText = fitCanvasText(
    ctx,
    photo.title || "Untitled Moment",
    LABEL_MAX_TEXT_W,
  );
  ctx.fillText(titleText, LABEL_PAD_X, 62);
  const rawDescription = photo.description?.trim() ?? "";
  let dateBaselineY = 124;
  if (rawDescription) {
    ctx.font = "400 25px sans-serif";
    ctx.fillStyle = isDark
      ? "rgba(245, 245, 245, 0.78)"
      : "rgba(17, 17, 17, 0.78)";
    ctx.fillText(
      fitCanvasText(ctx, rawDescription, LABEL_MAX_TEXT_W),
      LABEL_PAD_X,
      124,
    );
    dateBaselineY = 186;
  }
  ctx.font = "400 24px monospace";
  ctx.fillStyle = isDark
    ? "rgba(245, 245, 245, 0.65)"
    : "rgba(17, 17, 17, 0.65)";
  const dateText = fitCanvasText(
    ctx,
    formatDisplayDate(photo.created_at, photo.taken_at),
    LABEL_MAX_TEXT_W,
  );
  ctx.fillText(dateText, LABEL_PAD_X, dateBaselineY);
}
function buildRibbonGeometry(
  sFrom: number,
  sTo: number,
  getPair: (s: number) => {
    a: [number, number, number, number, number];
    b: [number, number, number, number, number];
  },
): THREE.BufferGeometry {
  const steps = Math.max(1, Math.ceil((sTo - sFrom) / 0.8));
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const s = sFrom + ((sTo - sFrom) * i) / steps;
    const { a, b } = getPair(s);
    positions.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    uvs.push(a[3], a[4], b[3], b[4]);
    if (i < steps) {
      const base = i * 2;
      indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}
function getThemeColors(isDark: boolean) {
  return {
    bgColor: isDark ? "#0A0A0A" : "#FAFAFA",
    placeholderColor: isDark ? 0x1a1a1a : 0xebebeb,
    errorColor: isDark ? 0x2a1818 : 0xe8dddd,
    wallStops: isDark
      ? [
          { stop: 0, color: "#0C0C0C" },
          { stop: 0.2, color: "#161616" },
          { stop: 0.6, color: "#161616" },
          { stop: 0.86, color: "#121212" },
          { stop: 1, color: "#0E0E0E" },
        ]
      : [
          { stop: 0, color: "#EAEAEA" },
          { stop: 0.2, color: "#F7F7F7" },
          { stop: 0.6, color: "#F7F7F7" },
          { stop: 0.86, color: "#F2F2F2" },
          { stop: 1, color: "#E8E8E8" },
        ],
    floorStops: isDark
      ? [
          { stop: 0, color: "#0C0C0C" },
          { stop: 0.5, color: "#151515" },
          { stop: 1, color: "#0C0C0C" },
        ]
      : [
          { stop: 0, color: "#E2E2E2" },
          { stop: 0.5, color: "#F0F0F0" },
          { stop: 1, color: "#E2E2E2" },
        ],
    ceilingColor: isDark ? 0x080808 : 0xf2f2f2,
    frameColor: isDark ? 0x000000 : 0xffffff,
  };
}
function getAxisDragDelta(dx: number, dy: number): number {
  return Math.abs(dx) > Math.abs(dy) ? -dx : -dy;
}
export interface WalkSceneCallbacks {
  onAtEndChange: (atEnd: boolean) => void;
  onContextError: (message: string) => void;
}
export interface WalkSceneController {
  setDarkMode: (dark: boolean) => void;
  handleWheel: (e: { deltaMode: number; deltaY: number }) => void;
  handlePointerDown: (e: {
    target: EventTarget | null;
    clientX: number;
    clientY: number;
    pointerId: number;
    captureTarget: Element;
  }) => void;
  handlePointerMove: (e: { clientX: number; clientY: number }) => void;
  handlePointerUp: (e: {
    clientX: number;
    clientY: number;
    pointerId: number;
    captureTarget: Element;
  }) => void;
  handlePointerCancel: (e: {
    pointerId: number;
    captureTarget: Element;
  }) => void;
  handleKeyDown: (e: KeyboardEvent) => void;
  returnToStart: () => void;
  dispose: () => void;
}
export function createWalkSceneController(
  canvas: HTMLCanvasElement,
  photos: Photo[],
  callbacks: WalkSceneCallbacks,
): WalkSceneController | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
  } catch {
    callbacks.onContextError(
      "Unable to initialize 3D WebGL view in this browser.",
    );
    return null;
  }
  let disposed = false;
  let isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  try {
    const gl = renderer.getContext();
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  } catch {}
  const theme = getThemeColors(isDark);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(theme.bgColor);
  scene.fog = new THREE.Fog(theme.bgColor, 10, 44);
  const initialAspect = window.innerWidth / window.innerHeight;
  let minS = getMinWalkS(initialAspect);
  const camera = new THREE.PerspectiveCamera(
    getWalkCameraFov(initialAspect),
    initialAspect,
    0.05,
    100,
  );
  const hemiLight = new THREE.HemisphereLight(
    isDark ? 0xf5f5f5 : 0xffffff,
    isDark ? 0x111111 : 0xe0e0e0,
    isDark ? 1.35 : 1.45,
  );
  scene.add(hemiLight);
  const ambLight = new THREE.AmbientLight(
    isDark ? 0x222222 : 0xffffff,
    isDark ? 0.45 : 0.5,
  );
  scene.add(ambLight);
  const wallMat = new THREE.MeshBasicMaterial({
    map: createGradientTexture(4, 256, true, theme.wallStops),
    side: THREE.DoubleSide,
  });
  const floorMat = new THREE.MeshBasicMaterial({
    map: createGradientTexture(256, 4, false, theme.floorStops),
    side: THREE.DoubleSide,
  });
  const ceilingMat = new THREE.MeshBasicMaterial({
    color: theme.ceilingColor,
    side: THREE.DoubleSide,
  });
  const frameMat = new THREE.MeshBasicMaterial({ color: theme.frameColor });
  const disposables: { dispose: () => void }[] = [
    wallMat,
    floorMat,
    ceilingMat,
    frameMat,
  ];
  const interactiveMeshes: THREE.Mesh[] = [];
  const frameEntries = new Map<number, FrameEntry>();
  const labelUpdaters: ((dark: boolean) => void)[] = [];
  const loader = new THREE.TextureLoader();
  loader.crossOrigin = "anonymous";
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const maxWalkS = getMaxWalkS(photos.length);
  let mode: WalkMode = { kind: "intro", startTime: performance.now() };
  let sCoord = minS;
  let targetS = minS;
  let pose: CameraPose = getWalkPoseForS(sCoord, window.innerWidth < 820);
  let glideStart: {
    startTime: number;
    duration: number;
    startPose: CameraPose;
    endPose: CameraPose;
  } | null = null;
  let pointerDown: { x: number; y: number; targetS: number } | null = null;
  let pointerHistory: { x: number; y: number; time: number }[] = [];
  let isDragging = false;
  let atEnd = false;
  let lastTexSyncS = Number.NEGATIVE_INFINITY;
  let lastTime = performance.now();
  let animFrameId: number | null = null;
  const track = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item);
    return item;
  };
  const cancelScheduledFrame = () => {
    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  };
  let scheduleRender = () => {};
  const syncVisibleTextures = (centerS: number, force = false) => {
    if (!force && Math.abs(centerS - lastTexSyncS) < 2) return;
    lastTexSyncS = centerS;
    const minLoadS = centerS - TEXTURE_LOAD_BEHIND_S;
    const maxLoadS = centerS + TEXTURE_LOAD_AHEAD_S;
    const minKeepS = centerS - TEXTURE_UNLOAD_BEHIND_S;
    const maxKeepS = centerS + TEXTURE_UNLOAD_AHEAD_S;
    for (const entry of frameEntries.values()) {
      if (entry.s >= minLoadS && entry.s <= maxLoadS) {
        if (entry.texState === "unloaded") {
          entry.texState = "loading";
          loader.load(
            entry.url,
            (tex) => {
              if (disposed) {
                tex.dispose();
                return;
              }
              if (
                entry.s < lastTexSyncS - TEXTURE_UNLOAD_BEHIND_S ||
                entry.s > lastTexSyncS + TEXTURE_UNLOAD_AHEAD_S
              ) {
                tex.dispose();
                entry.texState = "unloaded";
                return;
              }
              tex.colorSpace = THREE.SRGBColorSpace;
              tex.anisotropy = maxAniso;
              entry.tex = tex;
              entry.texState = "loaded";
              entry.printMat.color.setHex(0xffffff);
              entry.printMat.map = tex;
              entry.printMat.needsUpdate = true;
              scheduleRender();
            },
            undefined,
            () => {
              if (disposed) return;
              entry.texState = "error";
              entry.printMat.color.setHex(getThemeColors(isDark).errorColor);
              entry.printMat.needsUpdate = true;
              scheduleRender();
            },
          );
        }
      } else if (entry.s < minKeepS || entry.s > maxKeepS) {
        if (entry.texState === "loaded" && entry.tex) {
          entry.tex.dispose();
          entry.tex = null;
          entry.printMat.map = null;
          entry.printMat.color.setHex(getThemeColors(isDark).placeholderColor);
          entry.printMat.needsUpdate = true;
          entry.texState = "unloaded";
        }
      }
    }
  };
  const buildCorridor = (endS: number) => {
    if (endS > CORRIDOR_START_S) {
      const addCorridorRibbon = (
        material: THREE.Material,
        getPair: Parameters<typeof buildRibbonGeometry>[2],
      ) => {
        const geo = track(buildRibbonGeometry(CORRIDOR_START_S, endS, getPair));
        scene.add(new THREE.Mesh(geo, material));
      };
      for (const sign of [1, -1] as const) {
        addCorridorRibbon(wallMat, (s) => {
          const p = getCorridorPoint(s);
          const x = p.cx + sign * CORRIDOR_HALF_W * p.nx;
          const z = p.cz + sign * CORRIDOR_HALF_W * p.nz;
          const u = s * 0.1;
          return { a: [x, 0, z, u, 0], b: [x, H_WALL, z, u, 1] };
        });
      }
      for (const [y, material] of [
        [0, floorMat],
        [H_WALL, ceilingMat],
      ] as const) {
        addCorridorRibbon(material, (s) => {
          const p = getCorridorPoint(s);
          const v = s * 0.1;
          return {
            a: [
              p.cx - CORRIDOR_HALF_W * p.nx,
              y,
              p.cz - CORRIDOR_HALF_W * p.nz,
              0,
              v,
            ],
            b: [
              p.cx + CORRIDOR_HALF_W * p.nx,
              y,
              p.cz + CORRIDOR_HALF_W * p.nz,
              1,
              v,
            ],
          };
        });
      }
    }
    photos.forEach((photo, index) => {
      if (frameEntries.has(index)) return;
      const side = getAlternatingSide(index);
      const s = getFrameAnchorS(index);
      const pt = getCorridorPoint(s);
      const { w, h } = getPhotoDimensions(photo);
      const group = new THREE.Group();
      const wallOffset =
        side === "right" ? CORRIDOR_HALF_W - 0.04 : -(CORRIDOR_HALF_W - 0.04);
      group.position.set(
        pt.cx + wallOffset * pt.nx,
        0,
        pt.cz + wallOffset * pt.nz,
      );
      group.lookAt(pt.cx, 0, pt.cz);
      const frameGeo = track(new THREE.BoxGeometry(w + 0.07, h + 0.07, 0.05));
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.position.set(0, PY, 0.045);
      group.add(frame);
      const optimizedUrl = buildCloudinaryUrl(photo.cloudinary_url, [
        "f_auto",
        "q_auto",
        "w_1200",
      ]);
      const printGeo = track(new THREE.PlaneGeometry(w, h));
      const printMat = track(
        new THREE.MeshBasicMaterial({
          color: getThemeColors(isDark).placeholderColor,
        }),
      );
      const printMesh = new THREE.Mesh(printGeo, printMat);
      printMesh.position.set(0, PY, 0.072);
      group.add(printMesh);
      const labelCanvas = document.createElement("canvas");
      labelCanvas.width = LABEL_CANVAS_W;
      labelCanvas.height = LABEL_CANVAS_H;
      const labelCtx = labelCanvas.getContext("2d");
      if (labelCtx) drawLabelCanvas(labelCtx, photo, isDark);
      const labelTex = track(new THREE.CanvasTexture(labelCanvas));
      labelTex.colorSpace = THREE.SRGBColorSpace;
      labelTex.anisotropy = maxAniso;
      labelUpdaters.push((dark: boolean) => {
        if (labelCtx) {
          drawLabelCanvas(labelCtx, photo, dark);
          labelTex.needsUpdate = true;
        }
      });
      const labelW = Math.min(w, 0.88);
      const labelH = (labelW * LABEL_CANVAS_H) / LABEL_CANVAS_W;
      const labelGeo = track(new THREE.PlaneGeometry(labelW, labelH));
      const labelMat = track(
        new THREE.MeshBasicMaterial({ map: labelTex, transparent: true }),
      );
      const labelMesh = new THREE.Mesh(labelGeo, labelMat);
      labelMesh.position.set(0, PY - h / 2 - labelH / 2 - 0.12, 0.02);
      group.add(labelMesh);
      scene.add(group);
      const entry: FrameEntry = {
        index,
        photo,
        side,
        s,
        w,
        url: optimizedUrl || photo.cloudinary_url,
        printMat,
        texState: "unloaded",
        tex: null,
      };
      printMesh.userData = entry;
      frame.userData = entry;
      labelMesh.userData = entry;
      interactiveMeshes.push(printMesh, frame, labelMesh);
      frameEntries.set(index, entry);
    });
    syncVisibleTextures(pose.s, true);
  };
  // Entrance closing wall
  const startPt = getCorridorPoint(CORRIDOR_START_S);
  const startWallGeo = track(
    new THREE.PlaneGeometry(CORRIDOR_HALF_W * 2, H_WALL),
  );
  const startWall = new THREE.Mesh(startWallGeo, wallMat);
  startWall.position.set(startPt.cx, H_WALL / 2, startPt.cz);
  startWall.lookAt(
    startPt.cx + startPt.tx,
    H_WALL / 2,
    startPt.cz + startPt.tz,
  );
  scene.add(startWall);
  const initialEndS =
    photos.length > 0
      ? getFrameAnchorS(photos.length - 1) + END_WALL_PAD_S
      : CORRIDOR_START_S + 8;
  buildCorridor(initialEndS);
  if (photos.length > 0) {
    const endPt = getCorridorPoint(initialEndS);
    const endWallGeo = track(
      new THREE.PlaneGeometry(CORRIDOR_HALF_W * 2, H_WALL),
    );
    const endWall = new THREE.Mesh(endWallGeo, wallMat);
    endWall.position.set(endPt.cx, H_WALL / 2, endPt.cz);
    endWall.lookAt(endPt.cx - endPt.tx, H_WALL / 2, endPt.cz - endPt.tz);
    scene.add(endWall);
  }
  const render = () => {
    animFrameId = null;
    if (disposed || document.hidden) return;
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    let keepAnimating = false;
    if (mode.kind === "intro") {
      const progress = Math.min(1, (now - mode.startTime) / 1200);
      const ease = 1 - 2 ** (-10 * progress);
      if (progress >= 1) mode = { kind: "walk" };
      else {
        const introS = minS + 0.6 * ease;
        sCoord = introS;
        targetS = introS;
        pose.s = introS;
        keepAnimating = true;
      }
    }
    if (glideStart) {
      const { startTime, duration, startPose, endPose } = glideStart;
      const t = Math.min(1, (now - startTime) / duration);
      const easeS = 1 - (1 - t) ** 4;
      const easeYaw = 1 - (1 - t) ** 2;
      const easeCubic = 1 - (1 - t) ** 3;
      pose = {
        s: startPose.s + (endPose.s - startPose.s) * easeS,
        lat: startPose.lat + (endPose.lat - startPose.lat) * easeCubic,
        yaw: startPose.yaw + (endPose.yaw - startPose.yaw) * easeYaw,
        y: startPose.y + (endPose.y - startPose.y) * easeCubic,
        pitch: startPose.pitch + (endPose.pitch - startPose.pitch) * easeCubic,
      };
      sCoord = pose.s;
      if (t >= 1) glideStart = null;
      else keepAnimating = true;
    } else if (mode.kind === "walk") {
      targetS = clampWalkS(targetS, maxWalkS, minS);
      const diff = targetS - sCoord;
      if (Math.abs(diff) > 1e-4) {
        sCoord += diff * (1 - Math.exp(-dt / 0.32));
        keepAnimating = true;
      } else sCoord = targetS;
      pose.s = sCoord;
    }
    const shouldShowEnd =
      !glideStart &&
      mode.kind === "walk" &&
      photos.length > 0 &&
      sCoord >= maxWalkS - 1.5;
    if (shouldShowEnd !== atEnd) {
      atEnd = shouldShowEnd;
      callbacks.onAtEndChange(shouldShowEnd);
    }
    syncVisibleTextures(pose.s);
    const pt = getCorridorPoint(pose.s);
    const camX = pt.cx + pose.lat * pt.nx;
    const camZ = pt.cz + pose.lat * pt.nz;
    camera.position.set(camX, pose.y, camZ);
    const dirX = Math.cos(pose.yaw) * pt.tx + Math.sin(pose.yaw) * pt.nx;
    const dirZ = Math.cos(pose.yaw) * pt.tz + Math.sin(pose.yaw) * pt.nz;
    camera.lookAt(camX + dirX, pose.y + pose.pitch, camZ + dirZ);
    renderer.render(scene, camera);
    if (keepAnimating) scheduleRender();
  };
  scheduleRender = () => {
    if (disposed || document.hidden || animFrameId !== null) return;
    lastTime = performance.now();
    animFrameId = requestAnimationFrame(render);
  };
  scheduleRender();
  const dismissIntro = () => {
    if (mode.kind === "intro") mode = { kind: "walk" };
  };
  const startGlideTo = (endPose: CameraPose, duration = 950) => {
    glideStart = {
      startTime: performance.now(),
      duration,
      startPose: { ...pose },
      endPose: { ...endPose },
    };
    scheduleRender();
  };
  const focusFrame = (index: number) => {
    const entry = frameEntries.get(index);
    if (!entry) return;
    const isPortrait = window.innerWidth < 820;
    mode = { kind: "focus", index: entry.index };
    if (atEnd) {
      atEnd = false;
      callbacks.onAtEndChange(false);
    }
    startGlideTo(
      getFocusPoseForFrame(entry.s, entry.side, entry.w, isPortrait),
      950,
    );
  };
  const stepBack = () => {
    mode = { kind: "walk" };
    const isPortrait = window.innerWidth < 820;
    const clampedS = clampWalkS(sCoord, maxWalkS, minS);
    targetS = clampedS;
    startGlideTo(getWalkPoseForS(clampedS, isPortrait), 950);
  };
  const navigateAdjacent = (direction: 1 | -1) => {
    if (mode.kind !== "focus") return;
    const nextIndex = mode.index + direction;
    if (nextIndex < 0 || nextIndex >= photos.length) return;
    focusFrame(nextIndex);
  };
  const returnToStart = () => {
    mode = { kind: "walk" };
    atEnd = false;
    callbacks.onAtEndChange(false);
    const isPortrait = window.innerWidth < 820;
    const startS = minS + 0.6;
    targetS = startS;
    startGlideTo(getWalkPoseForS(startS, isPortrait), 1100);
  };
  const handleVisibilityChange = () => {
    if (document.hidden) cancelScheduledFrame();
    else scheduleRender();
  };
  const handleResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;
    camera.aspect = aspect;
    camera.fov = getWalkCameraFov(aspect);
    camera.updateProjectionMatrix();
    minS = getMinWalkS(aspect);
    if (mode.kind === "walk" && !glideStart)
      targetS = clampWalkS(targetS, maxWalkS, minS);
    renderer.setSize(width, height);
    scheduleRender();
  };
  const handleContextLost = (e: Event) => {
    e.preventDefault();
    cancelScheduledFrame();
    callbacks.onContextError(
      "3D graphics context was interrupted. Reload or browse the photo grid instead.",
    );
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("resize", handleResize);
  canvas.addEventListener("webglcontextlost", handleContextLost);
  return {
    setDarkMode(dark) {
      isDark = dark;
      const nextTheme = getThemeColors(dark);
      scene.background = new THREE.Color(nextTheme.bgColor);
      scene.fog = new THREE.Fog(nextTheme.bgColor, 10, 44);
      frameMat.color.set(nextTheme.frameColor);
      ceilingMat.color.set(nextTheme.ceilingColor);
      wallMat.map?.dispose();
      wallMat.map = createGradientTexture(4, 256, true, nextTheme.wallStops);
      wallMat.needsUpdate = true;
      floorMat.map?.dispose();
      floorMat.map = createGradientTexture(256, 4, false, nextTheme.floorStops);
      floorMat.needsUpdate = true;
      hemiLight.color.set(dark ? 0xf5f5f5 : 0xffffff);
      hemiLight.groundColor.set(dark ? 0x111111 : 0xe0e0e0);
      hemiLight.intensity = dark ? 1.35 : 1.45;
      ambLight.color.set(dark ? 0x222222 : 0xffffff);
      ambLight.intensity = dark ? 0.45 : 0.5;
      for (const entry of frameEntries.values()) {
        if (entry.texState === "unloaded")
          entry.printMat.color.setHex(nextTheme.placeholderColor);
        else if (entry.texState === "error")
          entry.printMat.color.setHex(nextTheme.errorColor);
      }
      for (const updateLabel of labelUpdaters) updateLabel(dark);
      scheduleRender();
    },
    handleWheel(e) {
      dismissIntro();
      if (mode.kind === "focus") {
        stepBack();
        return;
      }
      const delta = e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY;
      targetS = clampWalkS(targetS + -delta * 0.014, maxWalkS, minS);
      scheduleRender();
    },
    handlePointerDown(e) {
      if ((e.target as Element | null)?.closest("a, button")) return;
      try {
        e.captureTarget.setPointerCapture(e.pointerId);
      } catch {}
      pointerDown = { x: e.clientX, y: e.clientY, targetS };
      pointerHistory = [
        { x: e.clientX, y: e.clientY, time: performance.now() },
      ];
      isDragging = false;
    },
    handlePointerMove(e) {
      if (!pointerDown) return;
      const dx = e.clientX - pointerDown.x;
      const dy = e.clientY - pointerDown.y;
      if (!isDragging && dx * dx + dy * dy > 64) {
        isDragging = true;
        dismissIntro();
        if (mode.kind === "focus") stepBack();
      }
      if (isDragging) {
        const now = performance.now();
        pointerHistory.push({ x: e.clientX, y: e.clientY, time: now });
        pointerHistory = pointerHistory.filter((p) => now - p.time <= 120);
        const isMobile = window.innerWidth < 820;
        const factor = isMobile ? 0.048 : 0.024;
        const delta = getAxisDragDelta(dx, dy);
        targetS = clampWalkS(
          pointerDown.targetS + delta * factor,
          maxWalkS,
          minS,
        );
        scheduleRender();
      }
    },
    handlePointerUp(e) {
      try {
        e.captureTarget.releasePointerCapture(e.pointerId);
      } catch {}
      if (!pointerDown) return;
      const wasDrag = isDragging;
      const history = pointerHistory;
      pointerDown = null;
      isDragging = false;
      if (wasDrag && history.length >= 2) {
        const first = history[0];
        const last = history[history.length - 1];
        const dt = Math.max(16, last.time - first.time);
        const delta = getAxisDragDelta(last.x - first.x, last.y - first.y);
        const velocity = delta / dt;
        if (Math.abs(velocity) > 0.35) {
          const isMobile = window.innerWidth < 820;
          const momentumFactor = isMobile ? 2.8 : 1.4;
          targetS = clampWalkS(
            targetS + velocity * momentumFactor,
            maxWalkS,
            minS,
          );
          scheduleRender();
        }
      }
      if (!wasDrag) {
        dismissIntro();
        const rect = canvas.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1,
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactiveMeshes);
        if (intersects.length > 0) {
          const entry = intersects[0].object.userData as FrameEntry | undefined;
          if (entry?.photo) {
            focusFrame(entry.index);
            return;
          }
        }
        if (mode.kind === "focus") stepBack();
      }
    },
    handlePointerCancel(e) {
      try {
        e.captureTarget.releasePointerCapture(e.pointerId);
      } catch {}
      pointerDown = null;
      isDragging = false;
      pointerHistory = [];
    },
    handleKeyDown(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape") {
        if (mode.kind === "focus") stepBack();
      } else if (
        e.code === "ArrowUp" ||
        e.code === "KeyW" ||
        e.code === "ArrowRight" ||
        e.code === "KeyD"
      ) {
        e.preventDefault();
        dismissIntro();
        if (mode.kind === "focus") navigateAdjacent(1);
        else {
          targetS = clampWalkS(targetS + 3.2, maxWalkS, minS);
          scheduleRender();
        }
      } else if (
        e.code === "ArrowDown" ||
        e.code === "KeyS" ||
        e.code === "ArrowLeft" ||
        e.code === "KeyA"
      ) {
        e.preventDefault();
        dismissIntro();
        if (mode.kind === "focus") navigateAdjacent(-1);
        else {
          targetS = clampWalkS(targetS - 3.2, maxWalkS, minS);
          scheduleRender();
        }
      }
    },
    returnToStart,
    dispose() {
      disposed = true;
      cancelScheduledFrame();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      wallMat.map?.dispose();
      floorMat.map?.dispose();
      for (const entry of frameEntries.values()) entry.tex?.dispose();
      for (const item of disposables) item.dispose();
      frameEntries.clear();
      try {
        const glContext = renderer.getContext();
        glContext.pixelStorei(glContext.UNPACK_FLIP_Y_WEBGL, false);
        glContext.pixelStorei(glContext.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      } catch {}
      renderer.dispose();
    },
  };
}
