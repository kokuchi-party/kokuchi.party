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

import { fail } from "@sveltejs/kit";
import { drizzle } from "drizzle-orm/d1";

import { create } from "$/lib/server/media";

import type { Actions } from "./$types";

export const actions: Actions = {
  upload: async ({ platform, request, locals }) => {
    const d1 = platform?.env.DB;
    if (!d1) return fail(500, { message: "DB initialization failure" });

    const user = locals.user;
    if (!user) return fail(400, { message: "Not authorized" });

    const data = await request.formData();
    const file = data.get("file");
    if (!file || typeof file === "string") return fail(400, { message: "The file is invalid" });

    const db = drizzle(d1);
    const res = await create(user, db, file);

    if (res.ok) return res;
    return fail(res.status, { message: res.message });
  }
};
