import { redirect, type RequestEvent } from "@sveltejs/kit";
import { Lucia, type User, type Session, type Register, generateIdFromEntropySize } from "lucia";
import { and, eq, type InferSelectModel } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";

import { dev } from "$app/environment";
import { oauth_account, user } from "$schema";
import { D1KVAdapter } from "$lib/auth/adapter.server";
import { initialize as initializeGoogle } from "$lib/auth/google.server";

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
    interface Arctic {}

    interface Locals {
      lucia: Register["Lucia"];
      arctic: Arctic;
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
      event.locals.lucia = createLucia(event.locals.db, event.platform.env.KV);
    }
    await initializeGoogle(event);
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

export interface LoginUserArgs {
  provider_id: string;
  provider_user_id: string;
}

export interface RegisterUserArgs extends LoginUserArgs {
  name: string;
  email: string;
}

export async function linkUser(
  event: RequestEvent,
  signedInUser: User,
  { provider_id, provider_user_id }: LoginUserArgs
) {
  const db = event.locals.db;
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
  { name, email, provider_id, provider_user_id }: RegisterUserArgs
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

const cookieOption = {
  httpOnly: true,
  secure: !dev,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 10 // 10 min
} as const;

export function setRedirectUrl<S extends `/${string}`>(e: RequestEvent, path: S | URL) {
  const url = typeof path === "string" ? new URL(path, e.url.origin) : path;
  e.cookies.set("redirect_url", url.pathname, cookieOption);
}

export function getRedirectUrl(e: RequestEvent, modifier?: (url: URL) => void) {
  const value = e.cookies.get("redirect_url");
  if (!value) return "/";
  e.cookies.delete("redirect_url", cookieOption);
  const url = new URL(value, e.url.origin);

  if (modifier) modifier(url);

  // prevent infinite loop
  if (
    url.pathname.startsWith("/user/auth") ||
    url.pathname.startsWith("/user/login") ||
    url.pathname.startsWith("/user/logout")
  )
    return "/";

  return url.pathname + url.search + url.hash; // only return the local path
}

export const redirectBack = (...params: Parameters<typeof getRedirectUrl>) =>
  redirect(302, getRedirectUrl(...params));
