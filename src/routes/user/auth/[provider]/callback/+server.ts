import type { RequestEvent } from "@sveltejs/kit";
import { err } from "$lib";
import { getRedirectUrl, linkUser, loginOrRegisterUser } from "$lib/auth.server";
import { getRegisterUserArgs as getArgsGoogle } from "$lib/auth/google.server";

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
    const signedInUser = event.locals.user;
    if (signedInUser) {
      const ok = await linkUser(event, signedInUser, args);
      const redirectUrl = getRedirectUrl(event, (url) => url.searchParams.append("ok", String(ok)));
      return new Response(null, {
        status: 302,
        headers: {
          Location: redirectUrl
        }
      });
    } else {
      const userId = await loginOrRegisterUser(event, args);
      const session = await lucia.createSession(userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      event.cookies.set(sessionCookie.name, sessionCookie.value, {
        path: ".",
        ...sessionCookie.attributes
      });
      const redirectUrl = getRedirectUrl(event);
      return new Response(null, {
        status: 302,
        headers: {
          Location: redirectUrl
        }
      });
    }
  } catch (e) {
    console.error(e);
    return new Response(null, { status: 500 });
  }
}
