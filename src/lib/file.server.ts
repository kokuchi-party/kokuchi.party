import {
  S3_BUCKET,
  S3_ENDPOINT,
  S3_REGION,
  S3_ACCESS_KEY,
  S3_SECRET_KEY
} from "$env/static/private";

import { AwsClient } from "aws4fetch";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { base32crockford } from "@scure/base";
import { imageDimensionsFromStream } from "image-dimensions";

import { files } from "$schema";
import { err, ok } from "$lib";
import { getUploadFolderName, type MimeType } from "$lib/file";

export * from "$lib/file";

const client = new AwsClient({
  accessKeyId: S3_ACCESS_KEY,
  secretAccessKey: S3_SECRET_KEY,
  region: S3_REGION,
  service: "s3"
});

export const endpoint = `https://${S3_ENDPOINT}/${S3_BUCKET}`;

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

export async function calculateHash(file: File, length: number = 16): Promise<string> {
  const fileBuf = await file.arrayBuffer();
  const hashBuf = await crypto.subtle.digest("SHA-256", fileBuf);
  return base32crockford.encode(new Uint8Array(hashBuf)).slice(0, length);
}

export async function getImageDimensions(file: File) {
  return imageDimensionsFromStream(file.stream());
}

export async function create(db: DrizzleD1Database, file: File) {
  const hash = await calculateHash(file);
  const { mime, ext } = (await getFileType(file)) ?? {};
  if (!mime || !ext) return err({ status: 415, message: "Unsupported file type" });

  const folder = getUploadFolderName(mime);
  const name = ext ? `${hash}.${ext}` : hash;
  const url = folder ? `${endpoint}/${folder}/${name}` : `${endpoint}/${name}`;

  const res = await client.fetch(url, {
    body: file,
    method: "PUT",
    headers: {
      "Content-Type": mime
    }
  });

  if (!res.ok)
    return err({
      status: 500,
      message: "S3 upload failure"
    });

  const sizes = await getImageDimensions(file);

  try {
    const item = await db
      .insert(files)
      .values({
        folder,
        hash,
        ext,
        size: file.size,
        mime,
        ...sizes
      })
      .returning();

    return ok(item[0]);
  } catch (e) {
    return err({ status: 500, message: "DB insertion failure" });
  }
}
