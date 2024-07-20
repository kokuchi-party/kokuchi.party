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

import { redirect, type RequestEvent } from "@sveltejs/kit";
import { and, eq, type InferSelectModel } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { generateIdFromEntropySize, Lucia, type Register, type Session, type User } from "lucia";

import { dev } from "$app/environment";
import { err, ok } from "$lib";
import { type AuthAction, isAuthAction } from "$lib/common/auth";
import type { CookieOptions } from "$lib/common/cookie";
import { termRevised } from "$lib/constants";
import { D1KVAdapter } from "$lib/server/auth/adapter";
import { initialize as initializeGoogle } from "$lib/server/auth/google";
import { oauth_account, user } from "$schema";

export * from "$lib/common/auth";

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

const authActionCookie: CookieOptions = {
  path: "/",
  secure: !dev,
  httpOnly: true,
  sameSite: "lax",
  maxAge: 60 * 10 // 10 min
};

export function setAuthAction(event: RequestEvent, action: AuthAction) {
  event.cookies.set("auth_action", action, authActionCookie);
}

export async function oauth(
  event: RequestEvent,
  { name, email, provider_id, provider_user_id }: RegisterUserArgs
) {
  const action = event.cookies.get("auth_action");
  if (!isAuthAction(action)) return err({ reason: "INVALID_ACTION" });
  event.cookies.delete("auth_action", authActionCookie);
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

  // link a new OAuth account to an existing user
  async function link() {
    if (existingAccount) return err({ reason: "ALREADY_LINKED" });
    const loggedInUser = event.locals.user;
    if (!loggedInUser) return err({ reason: "NOT_LOGGED_IN" });
    await db.insert(oauth_account).values({
      provider_id,
      provider_user_id,
      user_id: loggedInUser.id
    });
    return ok({ id: loggedInUser.id, shouldReadTerms: false });
  }

  // log in as an existing user through an existing OAuth account
  async function login() {
    if (!existingAccount) return register(false);

    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, existingAccount.user_id))
      .get();

    if (!existingUser) {
      // this only happens when the DB is corrupted
      throw new Error("The OAuth account exists, but the corresponding user does not");
    }

    const shouldReadTerms = !existingUser.termsAccepted || existingUser.termsAccepted < termRevised;
    return ok({ id: existingAccount.user_id, shouldReadTerms });
  }

  // register a new user and a new OAuth account
  async function register(explicit: boolean) {
    const id = generateIdFromEntropySize(10); // 16 characters long
    await db.batch([
      db.insert(user).values({
        id,
        name,
        email,
        role: "user",
        termsAccepted: explicit ? new Date(Date.now()) : null
      }),
      db.insert(oauth_account).values({
        provider_id,
        provider_user_id,
        user_id: id
      })
    ] as const);

    // logged in without registration; needs to read and accept terms
    if (!explicit) return ok({ id, shouldReadTerms: true });
    // have already read & accepted terms before registration
    else return ok({ id, shouldReadTerms: false });
  }

  switch (action) {
    case "link": {
      return { ...(await link()), action };
    }

    case "login": {
      return { ...(await login()), action };
    }

    case "register": {
      return { ...(await register(true)), action };
    }
  }
}

export interface OpenIdUser {
  sub: string;
  name: string;
  email: string;
  picture: string;
}

const redirectUrlCookie: CookieOptions = {
  httpOnly: true,
  secure: !dev,
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 10 // 10 min
};

export function setRedirectUrl<S extends `/${string}`>(e: RequestEvent, path: S | URL) {
  const url = typeof path === "string" ? new URL(path, e.url.origin) : path;
  e.cookies.set("redirect_url", url.pathname, redirectUrlCookie);
}

function getRedirectUrl(e: RequestEvent, modifier?: (url: URL) => void) {
  const value = e.cookies.get("redirect_url");
  if (!value) return "/";
  e.cookies.delete("redirect_url", redirectUrlCookie);
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

export const redirectBack = (
  e: RequestEvent,
  status: Parameters<typeof redirect>[0] = 302,
  modifier?: (url: URL) => void
) => redirect(status, getRedirectUrl(e, modifier));

export const redirectBackResponse = (
  e: RequestEvent,
  status: Parameters<typeof redirect>[0] = 302,
  modifier?: (url: URL) => void
) => new Response(null, { status, headers: { Location: getRedirectUrl(e, modifier) } });
