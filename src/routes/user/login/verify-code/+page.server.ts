import { redirect, type RequestEvent } from "@sveltejs/kit";
import type { Actions } from "./$types";

import { RateLimiter } from "sveltekit-rate-limiter/server";
import { isCookieSet, verifyLoginCode } from "$lib/auth/email.server";
import { err } from "$lib";

const verifyLimiter = new RateLimiter({
  IP: [100, "d"], // IP address limiter
  IPUA: [10, "15m"] // IP + User Agent limiter
});

export async function load(event: RequestEvent) {
  // Redirect if already logged in
  if (event.locals.user) throw redirect(302, "/");

  // Redirect if login code is not sent
  if (!isCookieSet(event)) throw redirect(302, "/user/login");
}

export const actions: Actions = {
  async default(event) {
    const data = await event.request.formData();

    const code = data.get("code");
    if (!code || typeof code !== "string") return err({ reason: "INVALID_CODE" });

    if (await verifyLimiter.isLimited(event)) return err({ reason: "RATE_LIMITED" });

    const res = await verifyLoginCode(event, code);
    if (!res.ok) {
      // Redirect if login code is not sent (should not happen here)
      if (res.reason === "UNAUTHORIZED") throw redirect(302, "/");
      return res;
    }

    const lucia = event.locals.lucia;
    const session = await lucia.createSession(res.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes
    });
    throw redirect(302, "/");
  }
};
