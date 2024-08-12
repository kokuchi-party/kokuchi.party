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
import { redirectBack } from "$lib/server/auth";
import { isLoginCookieSet, verifyLoginCode } from "$lib/server/auth/email";

import type { Actions } from "./$types";

const verifyLimiter = new RateLimiter({
  IP: [25, "d"], // IP address limiter
  IPUA: [5, "10m"] // IP + User Agent limiter
});

export async function load(event: RequestEvent) {
  // Redirect if already logged in
  if (event.locals.user) throw redirectBack(event);

  // Redirect if login code is not sent
  if (!isLoginCookieSet(event)) throw redirect(302, "/user/login");
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
      if (res.reason === "UNAUTHORIZED") throw redirect(303, "/user/login");
      return res;
    }

    const lucia = event.locals.lucia;
    const session = await lucia.createSession(res.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes
    });

    if (res.shouldReadTerms) throw redirect(302, "/terms?mode=accept");
    throw redirectBack(event, 303);
  }
};
