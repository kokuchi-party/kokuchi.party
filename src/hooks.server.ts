import { dev } from "$app/environment";
import { handle as handleAuth } from "./auth";
import type { Handle } from "@sveltejs/kit";

export const handle = (async ({ event, resolve }) => {
  if (dev) {
    const { connectD1, connectKV, waitUntil } = await import("wrangler-proxy");
    event.platform = {
      env: {
        DB: connectD1("DB"),
        KV: connectKV("KV") as unknown as App.Platform["env"]["KV"]
      },
      context: { waitUntil }
    };
  }
  return handleAuth({ event, resolve });
}) satisfies Handle;
