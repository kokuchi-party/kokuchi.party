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
import { RateLimiter } from "sveltekit-rate-limiter/server";

import { err } from "$lib";
import { validateEmail } from "$lib/common/email";
import { redirectBack, setRedirectUrl } from "$lib/server/auth";
import { generateRegisterLink } from "$lib/server/auth/email";

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
    const data = await event.request.formData();
    const type = data.get("type");

    if (!(["email", "google", "instagram"] as const).includes(type))
      return err({ reason: "INVALID_TYPE" });

    const terms = data.get("terms");
    if (terms !== "on") return err({ reason: "CONSENT_REQUIRED" });

    if (type !== "email") throw redirect(303, `/user/auth/${type}/register`);

    const email = data.get("email");
    if (!email || typeof email !== "string" || !validateEmail(email))
      return err({ reason: "INVALID_EMAIL" });

    if (await generateLimiter.isLimited(event)) return err({ reason: "RATE_LIMITED" });
    return await generateRegisterLink(event, email);
  },

  async initiate(event) {
    const data = await event.request.formData();
    const origin = data.get("origin");
    if (origin && typeof origin === "string" && origin.startsWith("/")) {
      setRedirectUrl(event, origin);
    }
    throw redirect(303, "/user/register");
  }
};
