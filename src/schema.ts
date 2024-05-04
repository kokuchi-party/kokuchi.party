import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey().notNull(),
  title: text("title").notNull(),
  content: text("content")
});
