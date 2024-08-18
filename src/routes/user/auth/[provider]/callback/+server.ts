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

import { type RequestEvent } from "@sveltejs/kit";

import { setGlobalToast } from "$/lib/server/globalToast";
import { err } from "$lib";
import { oauth, redirectBackResponse } from "$lib/server/auth";
import { getRegisterUserArgs as getArgsGoogle } from "$lib/server/auth/google";

async function getRegisterUserArgs(event: RequestEvent) {
  switch (event.params.provider) {
    case "google":
      return getArgsGoogle(event);
    default:
      return err({ status: 404 });
  }
}

export async function GET(event: RequestEvent): Promise<Response> {
  const args = await getRegisterUserArgs(event);
  if (!args.ok) return new Response(null, { status: args.status });

  const lucia = event.locals.lucia;

  try {
    const res = await oauth(event, args);
    if (!res.ok) {
      // user with the same email exists
      if (res.reason === "ALREADY_REGISTERED") {
        setGlobalToast(event, "OAUTH_REGISTRATION_WITH_EXISTING_EMAIL");
        return new Response(null, {
          status: 302,
          headers: { Location: "/user/login" }
        });
      }
      return redirectBackResponse(event, 302, (url) => url.searchParams.append("err", res.reason));
    }

    const session = await lucia.createSession(res.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes
    });

    if (res.shouldReadTerms)
      return new Response(null, { status: 302, headers: { Location: "/terms?mode=accept" } });

    return redirectBackResponse(event, 302);
  } catch (e) {
    console.error(e);
    return new Response(null, { status: 500 });
  }
}
