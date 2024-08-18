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

import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

import type { RangedNumber } from "$lib/common/range";

export const user = sqliteTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["user", "admin", "banned"] }).notNull(),
  termsAccepted: integer("termsAccepted", { mode: "timestamp" })
});

export const oauth_account = sqliteTable(
  "oauth_account",
  {
    provider_id: text("provider_id").notNull(),
    provider_user_id: text("provider_user_id").notNull(),
    user_id: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
  },
  (table) => ({
    primary: primaryKey({ columns: [table.provider_id, table.provider_user_id] })
  })
);

export const media = sqliteTable("media", {
  id: integer("id").primaryKey(),
  folder: text("folder"),
  hash: text("hash").notNull(),
  ext: text("ext"),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  width: integer("width"),
  height: integer("height"),
  user_id: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
});

export type TimeOnly = { hour: RangedNumber<0, 24>; minute: RangedNumber<0, 60> };

export const venue = sqliteTable("venue", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url"),
  online: integer("online", { mode: "boolean" }).notNull().default(false),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  user_id: text("user_id").references(() => user.id, { onDelete: "cascade" })
});

export const event = sqliteTable("event", {
  id: text("id").notNull().primaryKey(),
  name: text("name").notNull(),
  date: integer("date", { mode: "timestamp" }).notNull(),
  open_time: text("door_time", { mode: "json" }).$type<TimeOnly>().notNull(),
  start_time: text("open_time", { mode: "json" }).$type<TimeOnly>(),
  media_id: text("media_id")
    .notNull()
    .references(() => media.id, { onDelete: "cascade" }),
  user_id: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
});
