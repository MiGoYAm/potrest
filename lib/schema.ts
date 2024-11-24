import { sql } from "drizzle-orm";
import { index, integer, text } from "drizzle-orm/sqlite-core";
import { sqliteTable } from "drizzle-orm/sqlite-core";

export const searchHistory = sqliteTable(
  "search_history",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    query: text().notNull().unique(),
    usedAt: integer({ mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`)
      .$onUpdate(() => sql`(unixepoch())`),
  },
  (table) => ({
    queryIdx: index("query_idx").on(table.query),
  })
);

export const startOfDay = sql`(unixepoch('now', 'start of day'))`;

export const viewHistory = sqliteTable("view_history", {
  characterSlug: text().primaryKey(),
  characterName: text().notNull(),
  viewedAt: integer({ mode: "timestamp" })
    .notNull()
    .default(startOfDay)
    .$onUpdate(() => startOfDay),
});

export const savedCharacters = sqliteTable("saved_characters", {
  characterSlug: text().primaryKey(),
  characterName: text().notNull(),
  savedAt: integer({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => sql`(unixepoch())`),
});
