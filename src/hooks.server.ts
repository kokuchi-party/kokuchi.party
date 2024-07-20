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

import { type Handle, redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

import { dev } from "$app/environment";
import { initialize as initializeAuth, setRedirectUrl } from "$lib/server/auth";
import { initialize as initializeDB } from "$lib/server/db";
import { handle as handleI18n } from "$lib/server/i18n";

const handleBase = (async ({ event, resolve }) => {
  if (dev && !event.platform) {
    const { connectD1, connectKV, waitUntil } = await import("wrangler-proxy");
    event.platform = {
      env: {
        DB: connectD1("DB"),
        KV: connectKV("KV"),
        DKIM_PRIVATE_KEY: "dummy"
      },
      context: { waitUntil }
    };
  }

  await initializeDB(event);
  await initializeAuth(event);

  if (
    !event.locals.user &&
    event.route.id?.startsWith("/(protected)/") &&
    event.url.pathname.startsWith("/")
  ) {
    setRedirectUrl(event, event.url.pathname);
    throw redirect(303, "/user/login");
  }

  return resolve(event);
}) satisfies Handle;

export const handle = sequence(handleBase, handleI18n);
