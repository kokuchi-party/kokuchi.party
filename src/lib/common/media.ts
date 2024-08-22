/*
  Copyright (c) 2024 kokuchi.party

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
  OR OTHER DEALINGS IN THE SOFTWARE.
*/

import type { MimeType } from "file-type";
export type { MimeType } from "file-type";

import type { InferSelectModel } from "drizzle-orm";

import { PUBLIC_CDN_DOMAIN } from "$env/static/public";
import type { media } from "$schema";

export type Media = InferSelectModel<typeof media>;

export function getMediaUrl({ folder, hash, ext }: Media) {
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
