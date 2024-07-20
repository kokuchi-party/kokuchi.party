import { redirect, type RequestEvent } from "@sveltejs/kit";
import { RateLimiter } from "sveltekit-rate-limiter/server";

import { err } from "$lib";
import { validateEmail } from "$lib/common/email";
import { redirectBack, setRedirectUrl } from "$lib/server/auth";
import { generateLoginCode } from "$lib/server/auth/email";

import type { Actions } from "./$types";

const generateLimiter = new RateLimiter({
  IP: [100, "d"], // IP address limiter
  IPUA: [10, "15m"] // IP + User Agent limiter
});

export async function load(event: RequestEvent) {
  // Redirect if already logged in
  if (event.locals.user) throw redirectBack(event);
}

export const actions: Actions = {
  async submit(event) {
    if (await generateLimiter.isLimited(event)) return err({ reason: "RATE_LIMITED" });

    const data = await event.request.formData();
    const email = data.get("email");

    if (!email || typeof email !== "string" || !validateEmail(email))
      return err({ reason: "INVALID_EMAIL" });

    const res = await generateLoginCode(event, email);

    if (res.ok) throw redirect(303, "/user/login/verify-code");
    return res;
  },

  async initiate(event) {
    const data = await event.request.formData();
    const origin = data.get("origin");
    if (origin && typeof origin === "string" && origin.startsWith("/")) {
      setRedirectUrl(event, origin);
    }
    throw redirect(303, "/user/login");
  }
};
