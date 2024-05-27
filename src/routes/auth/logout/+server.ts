import { redirect } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";

export async function GET(event: RequestEvent): Promise<Response> {
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
  redirect(302, "/");
}
