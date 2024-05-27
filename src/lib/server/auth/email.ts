import type { RequestEvent } from "@sveltejs/kit";
import { generateIdFromEntropySize } from "lucia";
import { generateRandomString, alphabet } from "oslo/crypto";
import { forEachKeyByPrefix } from "../kv";
import { user } from "$schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "../email";

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

export async function generateLoginCode(event: RequestEvent, email: string) {
  const db = event.locals.db;
  const kv = event.platform?.env.KV;

  if (!kv) throw new EmailAuthError(500);

  const id = generateIdFromEntropySize(10);

  const existingUser = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(eq(user.email, email))
    .get();

  if (!existingUser) return id; // dummy

  // wrap the rest of the operations in `waitUntil` to mitigate timing attack
  event.platform?.context.waitUntil(
    (async () => {
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
    })()
  );

  return id;
}

export async function verifyLoginCode(
  event: RequestEvent,
  { email, id, code }: { email: string; id: string; code: string }
) {
  const db = event.locals.db;
  const kv = event.platform?.env.KV;

  if (!kv) throw new EmailAuthError(500);

  const existingUser = await db
    .select({ id: user.id, email: user.email })
    .from(user)
    .where(eq(user.email, email))
    .get();
  if (!existingUser || existingUser.email !== email) return false;

  const correctCode = await kv.get(Key.login(existingUser.id, id));
  if (!correctCode || correctCode !== code) return false;

  await kv.delete(Key.login(existingUser.id, id));
  return existingUser.id;
}
