import { OAuth2RequestError } from "arctic";

import type { RequestEvent } from "@sveltejs/kit";
import { linkUser, loginOrRegisterUser, type OpenIdUser } from "$lib/server/auth";

export async function GET(event: RequestEvent): Promise<Response> {
  const lucia = event.locals.lucia;
  const google = event.locals.arctic.google;

  const code = event.url.searchParams.get("code");
  const state = event.url.searchParams.get("state");
  const storedState = event.cookies.get("google_oauth_state") ?? null;
  const storedCodeVerifier = event.cookies.get("google_code_verifier") ?? null;

  if (!code || !state || !storedState || !storedCodeVerifier || state !== storedState) {
    return new Response(null, { status: 400 });
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);
    const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`
      }
    });
    const { name, email, sub }: OpenIdUser = await response.json();

    const signedInUser = event.locals.user;
    if (signedInUser) {
      const ok = await linkUser(event, signedInUser, {
        provider_id: "google",
        provider_user_id: sub
      });
      return new Response(null, {
        status: 302,
        headers: {
          Location: `/?ok=${ok}` // TODO: redirect to account settings
        }
      });
    } else {
      const userId = await loginOrRegisterUser(event, {
        name,
        email,
        provider_id: "google",
        provider_user_id: sub
      });
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
    // the specific error message depends on the provider
    if (e instanceof OAuth2RequestError) {
      // invalid code
      return new Response(null, { status: 400 });
    }
    console.log(e);
    return new Response(null, { status: 500 });
  }
}
