import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
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

export const files = sqliteTable("files", {
  id: integer("id").primaryKey(),
  folder: text("folder"),
  hash: text("hash").notNull(),
  ext: text("ext"),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  width: integer("width"),
  height: integer("height")
});
