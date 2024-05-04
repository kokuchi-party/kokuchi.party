import { dev } from "$app/environment";
import type { Handle } from "@sveltejs/kit";

export const handle = (async ({ event, resolve }) => {
  if (dev) {
    const { connectD1, waitUntil } = await import("wrangler-proxy");
    event.platform = {
      env: { DB: connectD1("DB") },
      context: { waitUntil }
    };
  }
  return resolve(event);
}) satisfies Handle;
