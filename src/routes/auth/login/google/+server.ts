import { redirect } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";
import { generateState, generateCodeVerifier } from "arctic";

import { dev } from "$app/environment";

export async function GET(event: RequestEvent): Promise<Response> {
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

  redirect(302, url.toString());
}
