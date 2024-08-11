/*
  Copyright (C) 2024 kokuchi.party

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.

  You should have received a copy of the GNU Affero General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import type { RequestEvent } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { generateIdFromEntropySize } from "lucia";
import { alphabet, generateRandomString } from "oslo/crypto";

import { dev } from "$app/environment";
import { err, ok } from "$lib";
import { sendEmail } from "$lib/server/email";
import { forEachKeyByPrefix } from "$lib/server/kv";
import { user } from "$schema";

type Key = `magic:login:${string}:${string}` | `magic:register:${string}`;

const Key = {
  login: (userId: string, id: string) => `magic:login:${userId}:${id}`,
  register: (id: string) => `magic:register:${id}`
} as const satisfies Record<string, (...args: string[]) => Key>;

const Prefix = {
  login: (userId: string) => `magic:login:${userId}`
} as const;

export class EmailAuthError extends Error {
  status: number;
  constructor(status: number, message?: string, options?: ErrorOptions) {
    super(message, options);
    this.status = status;
  }
}

const loginCookieOption = {
  path: "/",
  secure: !dev,
  httpOnly: true,
  maxAge: 60 * 10 // 10 min
} as const;

export async function generateLoginCode(event: RequestEvent, email: string) {
  const db = event.locals.db;
  const kv = event.platform?.env.KV;

  if (!kv) return err({ status: 500, reason: "INTERNAL_ERROR", message: "KV is unavailable" });

  const id = generateIdFromEntropySize(10);

  const existingUser = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(eq(user.email, email))
    .get();

  event.cookies.set("email_login_address", email, loginCookieOption);
  event.cookies.set("email_login_id", id, loginCookieOption);

  // wrap the rest of the operations in `waitUntil` to mitigate timing attack
  event.platform?.context.waitUntil(
    (async () => {
      if (existingUser) {
        await forEachKeyByPrefix(kv, Prefix.login(existingUser.id), (key) => kv.delete(key));
        const code = generateRandomString(6, alphabet("0-9"));
        await kv.put(Key.login(existingUser.id, id), code, { expirationTtl: 600 /* 10 min */ });
        await sendEmail(event, {
          to: [{ email, name: existingUser.name }],
          subject: "[kokuchi.party] Login Code / ログインコード",
          content: [
            {
              type: "text/plain",
              value: `Your login code is: ${code}`
            }
          ]
        });
      }
    })()
  );

  return ok({});
}

export function isLoginCookieSet(event: RequestEvent) {
  return !!event.cookies.get("email_login_id") && !!event.cookies.get("email_login_address");
}

export async function verifyLoginCode(event: RequestEvent, code: string) {
  const db = event.locals.db;
  const kv = event.platform?.env.KV;

  if (!kv) return err({ status: 500, reason: "INTERNAL_ERROR", message: "KV is unavailable" });

  const id = event.cookies.get("email_login_id") ?? null;
  const email = event.cookies.get("email_login_address") ?? null;
  if (!id || !email) return err({ status: 400, reason: "UNAUTHORIZED" });

  const existingUser = await db
    .select({ id: user.id, email: user.email })
    .from(user)
    .where(eq(user.email, email))
    .get();
  if (!existingUser)
    return err({
      status: 400,
      reason: "INVALID_CODE" /* hide the fact that the user doesn't exist in the first place */
    });

  const correctCode = await kv.get(Key.login(existingUser.id, id));
  if (!correctCode || correctCode !== code) return err({ status: 400, reason: "INVALID_CODE" });

  await kv.delete(Key.login(existingUser.id, id));
  event.cookies.delete("email_login_id", loginCookieOption);
  event.cookies.delete("email_login_address", loginCookieOption);
  return ok(existingUser);
}

export async function generateRegisterLink(event: RequestEvent, email: string) {
  const db = event.locals.db;
  const kv = event.platform?.env.KV;

  if (!kv) return err({ status: 500, reason: "INTERNAL_ERROR", message: "KV is unavailable" });

  const existingUser = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(eq(user.email, email))
    .get();

  // wrap the rest of the operations in `waitUntil` to mitigate timing attack
  event.platform?.context.waitUntil(
    (async () => {
      if (!existingUser) {
        const id = generateIdFromEntropySize(25);
        await kv.put(Key.register(id), email, { expirationTtl: 3600 /* 1 hour */ });
        await sendEmail(event, {
          to: [{ email }],
          subject: "[kokuchi.party] Registration Link / 登録リンク",
          content: [
            {
              type: "text/plain",
              value: `Your registration link is: ${event.url.origin}/user/register/${id}`
            }
          ]
        });
      }
    })()
  );

  return ok({});
}

export async function getEmailById(event: RequestEvent, id: string) {
  const kv = event.platform?.env.KV;
  if (!kv) return err({ status: 500, reason: "INTERNAL_ERROR", message: "KV is unavailable" });

  const email = await kv.get(Key.register(id), { type: "text" });
  if (!email) return err({ reason: "INVALID_LINK" });
  return ok({ email });
}

export async function verifyRegisterLink(event: RequestEvent, id: string) {
  const res = await getEmailById(event, id);
  if (!res.ok) return res;
  const { email } = res;

  const db = event.locals.db;

  const existingUser = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(eq(user.email, email))
    .get();
  if (existingUser) return err({ reason: "ALREADY_REGISTERED" });

  return ok({ email });
}
