import { error, redirect, type RequestEvent } from "@sveltejs/kit";
import type { Actions } from "./$types";

import { RateLimiter } from "sveltekit-rate-limiter/server";
import { validateEmail } from "$lib/email";
import { generateLoginCode } from "$lib/auth/email.server";
import { err } from "$lib";

const generateLimiter = new RateLimiter({
  IP: [100, "d"], // IP address limiter
  IPUA: [10, "15m"] // IP + User Agent limiter
});

export async function load(event: RequestEvent) {
  // Redirect if already logged in
  if (event.locals.user) throw redirect(302, "/");
}

export const actions: Actions = {
  async default(event) {
    const data = await event.request.formData();
    const email = data.get("email");

    if (!email || typeof email !== "string" || !validateEmail(email))
      return err({ reason: "INVALID_EMAIL" });

    if (await generateLimiter.isLimited(event)) return err({ reason: "RATE_LIMITED" });

    const res = await generateLoginCode(event, email);

    if (res.ok) throw redirect(302, "/user/login/verify-code");
    throw error(res.status);
  }
};
