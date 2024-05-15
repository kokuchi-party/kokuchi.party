import type { MimeType } from "file-type";

export type { MimeType } from "file-type";

export const allowedMimeTypes = new Set<MimeType>(["image/jpeg", "image/png", "image/webp"]);

export type FolderName<S extends string> = S extends `/${string}`
  ? never
  : S extends `${string}/`
    ? never
    : S;

export const imageUploadFolder = "upload/images" as const;

export const videoUploadFolder = "upload/videos" as const;

export const audioUploadFolder = "upload/audios" as const;

export const documentUploadFolder = "upload/documents" as const;

export function getUploadFolderName(mime: MimeType) {
  if (mime.startsWith("image")) return imageUploadFolder;
  if (mime.startsWith("video")) return videoUploadFolder;
  if (mime.startsWith("audio")) return audioUploadFolder;
  return documentUploadFolder;
}
