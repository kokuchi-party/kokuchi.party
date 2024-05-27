import { redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

import { RateLimiter } from "sveltekit-rate-limiter/server";
import { validateEmail } from "$lib/email";
import { generateLoginCode, verifyLoginCode } from "$lib/server/auth/email";

import { dev } from "$app/environment";

const generateLimiter = new RateLimiter({
  IP: [1000, "d"], // IP address limiter
  IPUA: [10, "15m"] // IP + User Agent limiter
});

const verifyLimiter = new RateLimiter({
  IP: [1000, "d"], // IP address limiter
  IPUA: [10, "15m"] // IP + User Agent limiter
});

export const actions: Actions = {
  async generate(event) {
    if (await generateLimiter.isLimited(event))
      return { emailSent: false, errorCode: "RATE_LIMITED" as const };

    const data = await event.request.formData();
    const email = data.get("email");
    if (!email || typeof email !== "string" || !validateEmail(email)) return { emailSent: false };

    const id = await generateLoginCode(event, email);
    event.cookies.set("email_login_id", id, {
      path: "/",
      secure: !dev,
      httpOnly: true,
      maxAge: 60 * 10 // 10 min
    });
    return { email, emailSent: true };
  },

  async verify(event) {
    if (await verifyLimiter.isLimited(event))
      return { emailSent: true, errorCode: "RATE_LIMITED" as const };

    const id = event.cookies.get("email_login_id") ?? null;
    if (!id) return { emailSent: false };

    const data = await event.request.formData();
    const email = data.get("email");
    if (!email || typeof email !== "string" || !validateEmail(email))
      return { emailSent: true, errorCode: "INVALID_EMAIL" as const };

    const code = data.get("code");
    if (!code || typeof code !== "string")
      return { email, emailSent: true, errorCode: "INVALID_CODE" as const };

    const userId = await verifyLoginCode(event, { email, id, code });
    if (!userId) return { email, emailSent: true, errorCode: "INVALID_CODE" as const };

    event.cookies.delete("email_login_id", { path: "/" });

    const lucia = event.locals.lucia;
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes
    });
    throw redirect(302, "/");
  }
};
