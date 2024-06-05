import { redirect, type RequestEvent } from "@sveltejs/kit";
import type { Actions } from "./$types";

import { RateLimiter } from "sveltekit-rate-limiter/server";
import { verifyLoginCode } from "$lib/auth/email.server";
import { err } from "$lib";

const verifyLimiter = new RateLimiter({
  IP: [1000, "d"], // IP address limiter
  IPUA: [10, "15m"] // IP + User Agent limiter
});

export async function load(event: RequestEvent) {
  // Redirect if already logged in
  if (event.locals.user) throw redirect(302, "/");
}

export const actions: Actions = {
  async default(event) {
    if (await verifyLimiter.isLimited(event)) return err({ reason: "RATE_LIMITED" });

    const data = await event.request.formData();

    const code = data.get("code");
    if (!code || typeof code !== "string") return err({ reason: "INVALID_CODE" });

    const res = await verifyLoginCode(event, code);
    if (!res.ok) return res;

    event.cookies.delete("email_login_id", { path: "/" });
    event.cookies.delete("email_login_address", { path: "/" });

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
