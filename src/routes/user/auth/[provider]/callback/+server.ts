import type { RequestEvent } from "@sveltejs/kit";
import { err } from "$lib";
import { linkUser, loginOrRegisterUser } from "$lib/auth.server";
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
      return new Response(null, {
        status: 302,
        headers: {
          Location: `/?ok=${ok}` // TODO: redirect to account settings
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
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/"
        }
      });
    }
  } catch (e) {
    console.log(e);
    return new Response(null, { status: 500 });
  }
}
