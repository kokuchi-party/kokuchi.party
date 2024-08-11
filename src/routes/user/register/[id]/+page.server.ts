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

import { error, type RequestEvent } from "@sveltejs/kit";

import { getAccountName } from "$/lib/common/email";
import { getEmailById, verifyRegisterLink } from "$/lib/server/auth/email";
import { err } from "$lib";
import { redirectBack, registerWithEmail } from "$lib/server/auth";

import type { Actions } from "./$types";

export async function load(event: RequestEvent) {
  // Redirect if already logged in
  if (event.locals.user) throw redirectBack(event);

  const id = event.params.id;
  if (!id) throw error(404, "Invalid ID");

  const res = await verifyRegisterLink(event, id);
  if (!res.ok) throw error(404, "Invalid ID");

  return { ...res, name: getAccountName(res.email) };
}

export const actions: Actions = {
  async default(event) {
    const id = event.params.id;
    if (!id) throw error(404, "Invalid ID");

    const res = await getEmailById(event, id);
    if (!res.ok) throw error(404, "Invalid ID");
    const { email } = res;

    const data = await event.request.formData();
    const name = data.get("name");
    if (!name || typeof name !== "string" || name.length === 0)
      return err({ reason: "INVALID_NAME" });

    const res2 = await registerWithEmail(event, { name, email });
    if (!res2.ok) return res2;

    const lucia = event.locals.lucia;
    const session = await lucia.createSession(res2.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes
    });

    throw redirectBack(event, 303);
  }
};
