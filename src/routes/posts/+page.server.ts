import type { PageServerLoad } from "./$types";
import { posts } from "../../schema";
import { drizzle } from "drizzle-orm/d1";

export const load = (async ({ platform }) => {
  if (!platform) return { posts: [] };
  const db = drizzle(platform.env.DB);
  const now = Date.now();
  await db.insert(posts).values({ id: now, content: `${new Date(now).toString()}` });
  const data = await db.select().from(posts).all();
  return { posts: data };
}) satisfies PageServerLoad;
