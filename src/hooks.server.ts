import { dev } from "$app/environment";
import type { Handle } from "@sveltejs/kit";
import { initialize as initializeDB } from "$lib/server/db";
import { initialize as initializeAuth } from "$lib/server/auth";

export const handle = (async ({ event, resolve }) => {
  if (dev && !event.platform) {
    const { connectD1, connectKV, waitUntil } = await import("wrangler-proxy");
    event.platform = {
      env: {
        DB: connectD1("DB"),
        KV: connectKV("KV"),
        DKIM_PRIVATE_KEY: "dummy"
      },
      context: { waitUntil }
    };
  }

  await initializeDB(event);
  await initializeAuth(event);

  return resolve(event);
}) satisfies Handle;
