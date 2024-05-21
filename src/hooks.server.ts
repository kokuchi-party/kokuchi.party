import { dev } from "$app/environment";
import type { Handle } from "@sveltejs/kit";
import { drizzle } from "drizzle-orm/d1";
import { createStorage } from "unstorage";
import cloudflareKVBindingDriver, { type KVOptions } from "unstorage/drivers/cloudflare-kv-binding";

export const handle = (async ({ event, resolve }) => {
  if (dev) {
    const { connectD1, connectKV, waitUntil } = await import("wrangler-proxy");
    event.platform = {
      env: {
        DB: connectD1("DB"),
        KV: connectKV("KV") as unknown as App.Platform["env"]["KV"],
        DKIM_PRIVATE_KEY: "dummy"
      },
      context: { waitUntil }
    };
  }

  if (event.platform) {
    event.locals.db = drizzle(event.platform.env.DB);
    event.locals.kv = createStorage({
      driver: cloudflareKVBindingDriver({
        binding: event.platform.env.KV as unknown as KVOptions["binding"]
      })
    });
  }

  return resolve(event);
}) satisfies Handle;
