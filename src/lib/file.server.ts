import {
  S3_BUCKET,
  S3_ENDPOINT,
  S3_REGION,
  S3_ACCESS_KEY,
  S3_SECRET_KEY
} from "$env/static/private";

import { AwsClient } from "aws4fetch";
import type { InferSelectModel } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { base32crockford } from "@scure/base";
import { imageDimensionsFromStream } from "image-dimensions";

import { getFileType, getUploadFolderName } from "./file";
import { files } from "../schema";
import type { Result } from "$lib";

const client = new AwsClient({
  accessKeyId: S3_ACCESS_KEY,
  secretAccessKey: S3_SECRET_KEY,
  region: S3_REGION,
  service: "s3"
});

export const endpoint = `https://${S3_ENDPOINT}/${S3_BUCKET}`;

export type S3File = InferSelectModel<typeof files>;

export async function calculateHash(file: File, length: number = 16): Promise<string> {
  const fileBuf = await file.arrayBuffer();
  const hashBuf = await crypto.subtle.digest("SHA-256", fileBuf);
  return base32crockford.encode(new Uint8Array(hashBuf)).slice(0, length);
}

export async function getImageDimensions(file: File) {
  return imageDimensionsFromStream(file.stream());
}

export async function create(
  db: DrizzleD1Database,
  file: File
): Promise<Result<S3File, { status: number; message: string }>> {
  const hash = await calculateHash(file);
  const { mime, ext } = (await getFileType(file)) ?? {};
  if (!mime || !ext) return { ok: false, status: 415, message: "Unsupported file type" };

  const folder = getUploadFolderName(mime);
  const url = folder ? `${endpoint}/${folder}/${hash}` : `${endpoint}/${hash}`;

  const res = await client.fetch(url, {
    body: file,
    method: "PUT",
    headers: {
      "Content-Type": mime
    }
  });

  if (!res.ok)
    return {
      ok: false,
      status: 500,
      message: "S3 upload failure"
    };

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

    return { ...item[0], ok: true };
  } catch (e) {
    return { ok: false, status: 500, message: "DB insertion failure" };
  }
}
