import type { MimeType } from "file-type";
export type { MimeType } from "file-type";

import type { files } from "../schema";
import type { InferSelectModel } from "drizzle-orm";
import { PUBLIC_CDN_DOMAIN } from "$env/static/public";

export type S3File = InferSelectModel<typeof files>;

export function getFileUrl({ folder, hash, ext }: S3File) {
  return folder
    ? `https://${PUBLIC_CDN_DOMAIN}/${folder}/${hash}.${ext}`
    : `https://${PUBLIC_CDN_DOMAIN}/${hash}.${ext}`;
}

export const imageUploadFolder = "images" as const;

export const videoUploadFolder = "videos" as const;

export const audioUploadFolder = "audios" as const;

export const documentUploadFolder = "documents" as const;

export function getUploadFolderName(mime: MimeType) {
  if (mime.startsWith("image")) return imageUploadFolder;
  if (mime.startsWith("video")) return videoUploadFolder;
  if (mime.startsWith("audio")) return audioUploadFolder;
  return documentUploadFolder;
}
