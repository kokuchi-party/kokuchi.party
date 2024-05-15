import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

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
