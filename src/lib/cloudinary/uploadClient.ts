import {
  type CloudinarySignatureResponse,
  getCloudinarySignatureAction,
  type SavePhotoPayload,
} from "@/actions/upload";

// Cloudinary free-tier direct upload limit (10 MB)
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export interface UploadedCloudinaryAsset {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  image_metadata?: SavePhotoPayload["image_metadata"];
}
export async function uploadPhotoToCloudinary(
  file: File,
  {
    onStatusChange,
    signatureData,
  }: {
    onStatusChange?: (status: string) => void;
    signatureData?: CloudinarySignatureResponse;
  } = {},
): Promise<UploadedCloudinaryAsset> {
  let fileToUpload: File | Blob = file;
  if (file.size > MAX_UPLOAD_BYTES) {
    try {
      const { compressImage } = await import("imagepressor");
      fileToUpload = await compressImage(file, {
        mimeType: "image/webp",
        onProgress: (_progress, stage) => onStatusChange?.(`${stage}…`),
      });
    } catch (err) {
      console.warn("Image compression failed, uploading original:", err);
    }
  }
  const signData = signatureData ?? (await getCloudinarySignatureAction());
  onStatusChange?.("Uploading…");
  const formData = new FormData();
  formData.append("file", fileToUpload);
  formData.append("api_key", signData.apiKey);
  formData.append("timestamp", signData.timestamp.toString());
  formData.append("signature", signData.signature);
  formData.append("folder", signData.folder);
  formData.append("image_metadata", "true");
  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
    { method: "POST", body: formData },
  );
  if (!uploadRes.ok) {
    const errorJson = (await uploadRes.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    const errorMsg =
      errorJson?.error?.message ||
      `Cloudinary upload failed with status ${uploadRes.status}`;
    console.error("Cloudinary upload error:", errorMsg, errorJson);
    throw new Error(errorMsg);
  }
  return uploadRes.json();
}
