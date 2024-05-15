import { S3_BUCKET, S3_ENDPOINT } from "$env/static/private";
import { error } from "@sveltejs/kit";
import { imageUploadFolder } from "$lib/file";

import type { RequestHandler } from "./$types";

const sizes: Record<string, NonNullable<RequestInitCfProperties["image"]>> = {
  thumb: { width: 150, height: 150, fit: "cover" },
  xs: { width: 300, fit: "contain" },
  sm: { width: 600, fit: "contain" },
  md: { width: 840, fit: "contain" },
  lg: { width: 1080, fit: "contain" },
  xl: { width: 1200, fit: "contain" },
  orig: {}
};

const exts: Record<string, NonNullable<RequestInitCfProperties["image"]>> = {
  jpg: { format: "jpeg", quality: 90 },
  webp: { format: "webp", quality: 90 },
  png: { format: "png" }
};

export const GET: RequestHandler = async ({ params: { hash, size, ext }, request }) => {
  if (!sizes[size]) return error(404, "Not found");
  if (!exts[ext]) return error(404, "Not found");

  const url = `https://${S3_BUCKET}.${S3_ENDPOINT}/${imageUploadFolder}/${hash}`;
  const req = new Request(url, { headers: request.headers });

  const image: NonNullable<RequestInitCfProperties["image"]> = {
    metadata: "none",
    ...sizes[size],
    ...exts[ext]
  };

  return fetch(req, { cf: { image } });
};
