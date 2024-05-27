import type { RequestEvent } from "@sveltejs/kit";
import { Lucia, type User, type Session, type Register, generateIdFromEntropySize } from "lucia";
import { and, eq, type InferSelectModel } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { Google } from "arctic";

import { dev } from "$app/environment";
import { D1KVAdapter } from "$lib/server/auth/adapter";
import { oauth_account, user } from "$schema";
import { AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET } from "$env/static/private";

type DatabaseUserAttributes = InferSelectModel<typeof user>;

declare module "lucia" {
  interface Register {
    Lucia: ReturnType<typeof createLucia>;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

declare global {
  /* eslint-disable @typescript-eslint/no-namespace */
  namespace App {
    interface Locals {
      lucia: Register["Lucia"];
      arctic: {
        google: Google;
      };
      user: User | null;
      session: Session | null;
    }
  }
  /* eslint-enable @typescript-eslint/no-namespace */
}

function createLucia(d1: DrizzleD1Database, kv: KVNamespace) {
  return new Lucia(new D1KVAdapter(d1, kv), {
    sessionCookie: {
      attributes: {
        secure: !dev
      }
    },
    getUserAttributes(dbUser) {
      return {
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role
      };
    }
  });
}

export async function initialize(event: RequestEvent) {
  if (event.platform) {
    if (!event.locals.lucia) {
      const lucia = createLucia(event.locals.db, event.platform.env.KV);
      event.locals.lucia = lucia;
    }
    if (!event.locals.arctic) {
      const google = new Google(
        AUTH_GOOGLE_ID,
        AUTH_GOOGLE_SECRET,
        `${event.url.origin}/auth/callback/google`
      );
      const arctic = { google };
      event.locals.arctic = arctic;
    }
    const { lucia } = event.locals;

    const sessionId = event.cookies.get(lucia.sessionCookieName);
    if (!sessionId) {
      event.locals.session = null;
      event.locals.user = null;
      return;
    }
    const { session, user } = await lucia.validateSession(sessionId);
    if (session && session.fresh) {
      const sessionCookie = lucia.createSessionCookie(session.id);
      event.cookies.set(sessionCookie.name, sessionCookie.value, {
        path: ".",
        ...sessionCookie.attributes
      });
    }
    if (!session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      event.cookies.set(sessionCookie.name, sessionCookie.value, {
        path: ".",
        ...sessionCookie.attributes
      });
    }
    event.locals.user = user;
    event.locals.session = session;
  }
}

export async function linkUser(
  event: RequestEvent,
  signedInUser: User,
  { provider_id, provider_user_id }: { provider_id: string; provider_user_id: string }
) {
  const db = event.locals.db;

  // Log in as an existing user
  const existingAccount = await db
    .select()
    .from(oauth_account)
    .where(
      and(
        eq(oauth_account.provider_id, provider_id),
        eq(oauth_account.provider_user_id, provider_user_id)
      )
    )
    .get();
  if (existingAccount) return false;

  await db.insert(oauth_account).values({
    provider_id,
    provider_user_id,
    user_id: signedInUser.id
  });
  return true;
}

export async function loginOrRegisterUser(
  event: RequestEvent,
  {
    name,
    email,
    provider_id,
    provider_user_id
  }: { name: string; email: string; provider_id: string; provider_user_id: string }
) {
  const db = event.locals.db;

  // Log in as an existing user
  const existingAccount = await db
    .select()
    .from(oauth_account)
    .where(
      and(
        eq(oauth_account.provider_id, provider_id),
        eq(oauth_account.provider_user_id, provider_user_id)
      )
    )
    .get();
  if (existingAccount) {
    return existingAccount.user_id;
  }

  // Register a new user and a new OAuth account
  const userId = generateIdFromEntropySize(10); // 16 characters long
  await db.batch([
    db.insert(user).values({
      id: userId,
      name,
      email,
      role: "user"
    }),
    db.insert(oauth_account).values({
      provider_id,
      provider_user_id,
      user_id: userId
    })
  ]);
  return userId;
}

export interface OpenIdUser {
  sub: string;
  name: string;
  email: string;
  picture: string;
}
