import { type RequestEvent } from "@sveltejs/kit";

import { err } from "$lib";
import { oauth, redirectBackResponse } from "$lib/server/auth";
import { getRegisterUserArgs as getArgsGoogle } from "$lib/server/auth/google";

async function getRegisterUserArgs(event: RequestEvent) {
  switch (event.params.provider) {
    case "google":
      return getArgsGoogle(event);
    default:
      return err({ status: 404 });
  }
}

export async function GET(event: RequestEvent): Promise<Response> {
  const args = await getRegisterUserArgs(event);
  if (!args.ok) return new Response(null, { status: args.status });

  const lucia = event.locals.lucia;

  try {
    const res = await oauth(event, args);
    if (!res.ok)
      return redirectBackResponse(event, 302, (url) => url.searchParams.append("err", res.reason));

    const session = await lucia.createSession(res.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes
    });

    if (res.shouldReadTerms)
      return new Response(null, { status: 302, headers: { Location: "/terms?mode=accept" } });

    return redirectBackResponse(event, 302);
  } catch (e) {
    console.error(e);
    return new Response(null, { status: 500 });
  }
}
