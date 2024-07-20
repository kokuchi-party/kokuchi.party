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

import type { RequestEvent } from "@sveltejs/kit";

import { redirectBack, setRedirectUrl } from "$lib/server/auth";

async function logout(event: RequestEvent, method: "GET" | "POST") {
  const { lucia } = event.locals;

  if (!event.locals.session) {
    return new Response(null, { status: 401 });
  }
  await lucia.invalidateSession(event.locals.session.id);
  const sessionCookie = lucia.createBlankSessionCookie();
  event.cookies.set(sessionCookie.name, sessionCookie.value, {
    path: ".",
    ...sessionCookie.attributes
  });

  throw redirectBack(event, method === "GET" ? 302 : 303);
}

export async function GET(event: RequestEvent): Promise<Response> {
  return await logout(event, "GET");
}

export async function POST(event: RequestEvent) {
  const data = await event.request.formData();
  const origin = data.get("origin");
  if (origin && typeof origin === "string" && origin.startsWith("/")) {
    setRedirectUrl(event, origin);
  }
  return await logout(event, "POST");
}
