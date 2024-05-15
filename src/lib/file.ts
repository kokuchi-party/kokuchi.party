import type { MimeType } from "file-type";

export type { MimeType } from "file-type";

const fileTypes = {
  "image/jpeg": { magic: [0xff, 0xd8, 0xff], ext: "jpg" },
  "image/png": { magic: [0x89, 0x50, 0x4e, 0x47], ext: "png" },
  "image/webp": { magic: [0x52, 0x49, 0x46, 0x46], ext: "webp" }
} as const satisfies Partial<Record<MimeType, { magic: number[]; ext: string }>>;

export async function getFileType(file: File) {
  const buf = new Uint8Array(await file.slice(0, 64).arrayBuffer());
  for (const [mime, { magic, ext }] of Object.entries(fileTypes)) {
    if (magic.every((x, i) => buf[i] === x)) {
      return { mime: mime as unknown as MimeType, ext };
    }
  }
}

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
