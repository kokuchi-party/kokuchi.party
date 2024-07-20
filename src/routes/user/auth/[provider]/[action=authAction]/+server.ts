import { isAuthAction, setAuthAction } from "$lib/auth.server";
import { authorize as authorizeGoogle } from "$lib/auth/google.server";
import type { RequestEvent } from "@sveltejs/kit";

export async function GET(event: RequestEvent) {
  const action = event.params.action;
  if (!isAuthAction(action)) return new Response(null, { status: 400 });

  setAuthAction(event, action);

  switch (event.params.provider) {
    case "google":
      return authorizeGoogle(event);
    default:
      return new Response(null, { status: 404 });
  }
}
