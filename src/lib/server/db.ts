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
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";

declare global {
  /* eslint-disable @typescript-eslint/no-namespace */
  namespace App {
    interface Locals {
      db: DrizzleD1Database;
    }
  }
  /* eslint-enable @typescript-eslint/no-namespace */
}

export async function initialize(event: RequestEvent) {
  if (event.platform && !event.locals.db) {
    const db = drizzle(event.platform.env.DB);
    event.locals.db = db;
  }
}
