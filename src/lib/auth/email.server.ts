import type { RequestEvent } from "@sveltejs/kit";
import { generateIdFromEntropySize } from "lucia";
import { generateRandomString, alphabet } from "oslo/crypto";
import { user } from "$schema";
import { eq } from "drizzle-orm";
import { err, ok } from "$lib";
import { forEachKeyByPrefix } from "$lib/kv.server";
import { sendEmail } from "$lib/email.server";
import { dev } from "$app/environment";

type Key = `magic:login:${string}:${string}`;

const Key = {
  login: (userId: string, id: string) => `magic:login:${userId}:${id}`
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

const cookieOption = {
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

  event.cookies.set("email_login_address", email, cookieOption);
  event.cookies.set("email_login_id", id, cookieOption);

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

export function isCookieSet(event: RequestEvent) {
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
  event.cookies.delete("email_login_id", cookieOption);
  event.cookies.delete("email_login_address", cookieOption);
  return ok(existingUser);
}
