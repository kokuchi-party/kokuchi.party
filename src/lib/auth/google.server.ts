import { Google, generateState, generateCodeVerifier, OAuth2RequestError } from "arctic";
import { redirect, type RequestEvent } from "@sveltejs/kit";
import type { RegisterUserArgs, OpenIdUser } from "$lib/auth.server";
import { dev } from "$app/environment";
import { AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET } from "$env/static/private";
import { err, ok } from "$lib";

declare global {
  /* eslint-disable @typescript-eslint/no-namespace */
  namespace App {
    interface Arctic {
      google: Google;
    }
  }
  /* eslint-enable @typescript-eslint/no-namespace */
}

const getGoogle = (event: RequestEvent) =>
  new Google(AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, `${event.url.origin}/user/auth/google/callback`);

export async function initialize(event: RequestEvent) {
  if (event.platform) {
    if (!event.locals.arctic) {
      const google = getGoogle(event);
      event.locals.arctic = { google };
    } else if (!event.locals.arctic.google) {
      const google = getGoogle(event);
      event.locals.arctic.google = google;
    }
  }
}

export async function authorize(event: RequestEvent) {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  const url = await event.locals.arctic.google.createAuthorizationURL(state, codeVerifier, {
    scopes: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email"
    ]
  });

  event.cookies.set("google_oauth_state", state, {
    path: "/",
    secure: !dev,
    httpOnly: true,
    maxAge: 60 * 10 // 10 min
  });
  event.cookies.set("google_code_verifier", codeVerifier, {
    path: "/",
    secure: !dev,
    httpOnly: true,
    maxAge: 60 * 10 // 10 min
  });

  return redirect(302, url.toString());
}

export async function getRegisterUserArgs(event: RequestEvent) {
  const google = event.locals.arctic.google;
  const code = event.url.searchParams.get("code");
  const state = event.url.searchParams.get("state");
  const storedState = event.cookies.get("google_oauth_state") ?? null;
  const storedCodeVerifier = event.cookies.get("google_code_verifier") ?? null;

  if (!code || !state || !storedState || !storedCodeVerifier || state !== storedState) {
    return err({ status: 400 });
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);
    const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`
      }
    });
    const { name, email, sub }: OpenIdUser = await response.json();

    return ok({
      name,
      email,
      provider_id: "google",
      provider_user_id: sub
    } as RegisterUserArgs);
  } catch (e) {
    if (e instanceof OAuth2RequestError) {
      // invalid code
      return err({ status: 400 });
    }
    console.error(e);
    return err({ status: 500 });
  }
}
