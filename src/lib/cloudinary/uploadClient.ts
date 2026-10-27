import {
  type CloudinarySignatureResponse,
  getCloudinarySignatureAction,
  type SavePhotoPayload,
} from "@/actions/upload";
import { compressImageWithExif } from "@/lib/utils/imageCompression";
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
  const fileToUpload = await compressImageWithExif(file, onStatusChange);
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
  if (!uploadRes.ok) throw new Error("Cloudinary upload failed");
  return uploadRes.json();
}
