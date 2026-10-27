import imageCompression from "browser-image-compression";
import { MAX_ORIGINAL_PHOTO_BYTES, MAX_PHOTO_DIMENSION, type PhotoContentType } from "@/lib/constants";
import { messages } from "@/lib/validation";

let webpSupported: boolean | null = null;

/** Safari can't encode WebP from a canvas, so fall back to JPEG there. */
function canEncodeWebp(): boolean {
  if (webpSupported === null) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    webpSupported = canvas.toDataURL("image/webp").startsWith("data:image/webp");
  }
  return webpSupported;
}

/** Returns a Hebrew error message if the picked file can't be used. */
export function checkPickedFile(file: File): string | null {
  if (!file.type.startsWith("image/")) return messages.photoNotImage;
  if (file.size > MAX_ORIGINAL_PHOTO_BYTES) return messages.photoTooLarge;
  return null;
}

/** Resizes to at most 1600px on the longest side and re-encodes as WebP (or JPEG). */
export async function compressPhoto(file: File): Promise<File> {
  const fileType: PhotoContentType = canEncodeWebp() ? "image/webp" : "image/jpeg";

  const compressed = await imageCompression(file, {
    maxWidthOrHeight: MAX_PHOTO_DIMENSION,
    maxSizeMB: 1,
    initialQuality: 0.82,
    fileType,
    useWebWorker: true,
  });

  // Guard against a browser silently producing another format (e.g. PNG).
  if (compressed.type !== fileType) {
    throw new Error(`Unexpected output type ${compressed.type}`);
  }

  const extension = fileType === "image/webp" ? "webp" : "jpg";
  return new File([compressed], `photo.${extension}`, { type: fileType });
}
