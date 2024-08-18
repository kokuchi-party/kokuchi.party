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

import { dev } from "$app/environment";
import type { CookieOptions } from "$lib/common/cookie";
import { getMessage, type GlobalToastTag, isGlobalToastTag } from "$lib/common/globalToast";

const cookieName = "global_toast";

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: !dev,
  sameSite: "lax",
  path: "/",
  maxAge: 60 // 1 min
};

export function setGlobalToast(e: RequestEvent, t: GlobalToastTag) {
  e.cookies.set(cookieName, t, cookieOptions);
}

export function getGlobalToast(e: RequestEvent): string | undefined {
  const tag = e.cookies.get(cookieName);
  if (!tag) return undefined;
  e.cookies.delete(cookieName, cookieOptions);
  if (!isGlobalToastTag(tag)) return undefined;
  return getMessage(tag, e.locals.lang);
}

export * from "$lib/common/globalToast";
