const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB Cloudinary direct upload limit
/**
 * Extracts raw EXIF (APP1) and ICC Profile (APP2) metadata segments from a JPEG file.
 * Reads only the first 256 KB of the file, keeping memory usage minimal.
 */
async function extractMetadataSegments(file: File): Promise<Uint8Array[]> {
  const chunkSize = Math.min(file.size, 256 * 1024);
  const buffer = await file.slice(0, chunkSize).arrayBuffer();
  const view = new DataView(buffer);
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return [];
  const segments: Uint8Array[] = [];
  let offset = 2;
  while (offset + 4 < view.byteLength) {
    const marker = view.getUint16(offset);
    // Stop at Start of Scan (SOS), End of Image (EOI), or invalid marker
    if (marker === 0xffda || marker === 0xffd9 || (marker & 0xff00) !== 0xff00)
      break;
    const segLength = view.getUint16(offset + 2);
    if (segLength < 2 || offset + 2 + segLength > view.byteLength) break;
    // Preserve APP1 (0xFFE1: Exif / XMP) and APP2 (0xFFE2: ICC color profile)
    if (marker === 0xffe1 || marker === 0xffe2) {
      const segBytes = new Uint8Array(
        buffer.slice(offset, offset + 2 + segLength),
      );
      resetOrientationTo1(segBytes);
      segments.push(segBytes);
    }
    offset += 2 + segLength;
  }
  return segments;
}
/**
 * Normalizes the EXIF Orientation tag to 1 (normal / top-left) in place.
 * Since HTML5 canvas decodes and draws the image upright, resetting orientation to 1
 * ensures external image viewers do not rotate the photo a second time.
 */
function resetOrientationTo1(segment: Uint8Array): void {
  // Check for APP1 marker (0xFFE1) + length + 'Exif\0\0'
  if (segment.length < 14) return;
  const isExif =
    segment[0] === 0xff &&
    segment[1] === 0xe1 &&
    segment[4] === 0x45 && // 'E'
    segment[5] === 0x78 && // 'x'
    segment[6] === 0x69 && // 'i'
    segment[7] === 0x66 && // 'f'
    segment[8] === 0x00 &&
    segment[9] === 0x00;
  if (!isExif) return;
  const tiffStart = 10;
  const view = new DataView(
    segment.buffer,
    segment.byteOffset,
    segment.byteLength,
  );
  const isLittleEndian = view.getUint16(tiffStart) === 0x4949; // 'II'
  if (!isLittleEndian && view.getUint16(tiffStart) !== 0x4d4d) return; // 'MM'
  if (view.getUint16(tiffStart + 2, isLittleEndian) !== 0x002a) return; // 42
  const firstIfdOffset = view.getUint32(tiffStart + 4, isLittleEndian);
  const ifdStart = tiffStart + firstIfdOffset;
  if (ifdStart + 2 > segment.length) return;
  const tagCount = view.getUint16(ifdStart, isLittleEndian);
  for (let i = 0; i < tagCount; i++) {
    const entryOffset = ifdStart + 2 + i * 12;
    if (entryOffset + 12 > segment.length) break;
    const tagId = view.getUint16(entryOffset, isLittleEndian);
    if (tagId === 0x0112) {
      // Orientation tag: write 1 (SHORT = 3, count = 1)
      view.setUint16(entryOffset + 8, 1, isLittleEndian);
      break;
    }
  }
}
/**
 * Resizes and compresses an image file using hardware-accelerated native HTML5 Canvas.
 */
function compressWithCanvas(
  file: File,
  maxDimension: number,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { naturalWidth: width, naturalHeight: height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 2D context unavailable"));
        return;
      }
      // Pre-fill white background so transparent PNG/WebP images don't render with black background in JPEG
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Canvas compression failed"));
        },
        "image/jpeg",
        quality,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for compression"));
    };
    img.src = url;
  });
}
/**
 * Injects raw original metadata segments into the canvas-compressed JPEG blob.
 */
async function spliceMetadataIntoBlob(
  compressedBlob: Blob,
  metadataSegments: Uint8Array[],
): Promise<Blob> {
  if (metadataSegments.length === 0) return compressedBlob;
  const headBuffer = await compressedBlob.slice(0, 32).arrayBuffer();
  const headView = new DataView(headBuffer);
  if (headView.byteLength < 4 || headView.getUint16(0) !== 0xffd8)
    return compressedBlob;
  let startOffset = 2; // Right after SOI (0xFFD8)
  if (headView.getUint16(2) === 0xffe0) {
    const jfifLen = headView.getUint16(4);
    startOffset = 4 + jfifLen;
  }
  const headerPart = compressedBlob.slice(0, startOffset);
  const bodyPart = compressedBlob.slice(startOffset);
  const segmentBuffers: BlobPart[] = metadataSegments.map(
    (s) => s.buffer as ArrayBuffer,
  );
  return new Blob([headerPart, ...segmentBuffers, bodyPart], {
    type: "image/jpeg",
  });
}
/**
 * Compresses an image if it exceeds 10 MB to satisfy Cloudinary's direct upload limit,
 * preserving EXIF camera and capture metadata.
 */
export async function compressImageWithExif(
  file: File,
  onStatusChange?: (status: string) => void,
): Promise<File> {
  if (typeof window === "undefined" || file.size <= MAX_UPLOAD_BYTES)
    return file;
  onStatusChange?.("Compressing large photo...");
  try {
    // 1. Extract raw EXIF & ICC segments from original file before compression
    const metadataSegments = await extractMetadataSegments(file);
    // 2. Compress image using hardware-accelerated canvas
    let compressedBlob = await compressWithCanvas(file, 3840, 0.84);
    // 3. If still exceeding limit, second pass with lower dimension/quality
    if (compressedBlob.size > MAX_UPLOAD_BYTES) {
      const tempFile = new File([compressedBlob], "temp.jpg", {
        type: "image/jpeg",
      });
      compressedBlob = await compressWithCanvas(tempFile, 2560, 0.74);
    }
    // 4. Splice original EXIF back into the compressed JPEG
    const finalBlob = await spliceMetadataIntoBlob(
      compressedBlob,
      metadataSegments,
    );
    const baseName = file.name.replace(/\.[^/.]+$/, "") || "photo";
    return new File([finalBlob], `${baseName}.jpg`, {
      type: "image/jpeg",
      lastModified: file.lastModified,
    });
  } catch (err) {
    console.warn(
      "Client compression failed; falling back to original file:",
      err,
    );
    return file;
  }
}
