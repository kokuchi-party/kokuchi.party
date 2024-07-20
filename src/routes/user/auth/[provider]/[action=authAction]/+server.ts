import type { RequestEvent } from "@sveltejs/kit";

import { isAuthAction, setAuthAction } from "$lib/server/auth";
import { authorize as authorizeGoogle } from "$lib/server/auth/google";

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
