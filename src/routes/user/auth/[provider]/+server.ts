import { authorize as authorizeGoogle } from "$lib/auth/google.server";
import type { RequestEvent } from "@sveltejs/kit";

export async function GET(event: RequestEvent) {
  switch (event.params.provider) {
    case "google":
      return authorizeGoogle(event);
    default:
      return new Response(null, { status: 404 });
  }
}
