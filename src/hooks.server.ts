import { dev } from "$app/environment";

export async function handle({ event, resolve }) {
  if (dev) {
    const { connectD1, waitUntil } = await import("wrangler-proxy");
    event.platform = {
      env: { DB: connectD1("DB") },
      context: { waitUntil }
    };
  }
  return resolve(event);
}
