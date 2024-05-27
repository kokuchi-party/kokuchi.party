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
  if (event.platform) {
    const db = drizzle(event.platform.env.DB);
    event.locals.db = db;
  }
}
