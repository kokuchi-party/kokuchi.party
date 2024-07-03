import { dev } from "$app/environment";
import { redirect, type Handle } from "@sveltejs/kit";
import { initialize as initializeDB } from "$lib/db.server";
import { initialize as initializeAuth, setRedirectUrl } from "$lib/auth.server";
import { handle as handleI18n } from "$lib/i18n.server";
import { sequence } from "@sveltejs/kit/hooks";

const handleBase = (async ({ event, resolve }) => {
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

  if (
    !event.locals.user &&
    event.route.id?.startsWith("/(protected)/") &&
    event.url.pathname.startsWith("/")
  ) {
    setRedirectUrl(event, event.url.pathname);
    throw redirect(303, "/user/login");
  }

  return resolve(event);
}) satisfies Handle;

export const handle = sequence(handleBase, handleI18n);
