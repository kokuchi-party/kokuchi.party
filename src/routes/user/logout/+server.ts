import { redirectBack, setRedirectUrl } from "$lib/auth.server";
import type { RequestEvent } from "@sveltejs/kit";

async function logout(event: RequestEvent) {
  const { lucia } = event.locals;

  if (!event.locals.session) {
    return new Response(null, { status: 401 });
  }
  await lucia.invalidateSession(event.locals.session.id);
  const sessionCookie = lucia.createBlankSessionCookie();
  event.cookies.set(sessionCookie.name, sessionCookie.value, {
    path: ".",
    ...sessionCookie.attributes
  });

  throw redirectBack(event);
}

export async function GET(event: RequestEvent): Promise<Response> {
  return await logout(event);
}

export async function POST(event: RequestEvent) {
  const data = await event.request.formData();
  const origin = data.get("origin");
  if (origin && typeof origin === "string" && origin.startsWith("/")) {
    setRedirectUrl(event, origin);
  }
  return await logout(event);
}
