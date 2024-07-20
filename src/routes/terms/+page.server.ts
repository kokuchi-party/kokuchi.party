import type { PageServerLoad, Actions } from "./$types";

import { err } from "$lib";
import { termRevised } from "$lib/constant";
import { user } from "$schema";
import { eq } from "drizzle-orm";
import { redirectBack } from "$lib/auth.server";

export const load: PageServerLoad = async (event) => {
  const mode = event.url.searchParams.get("mode");

  const fallback = () => {
    return { mode: undefined };
  };

  switch (mode) {
    case "accept": {
      const userId = event.locals.user?.id;
      if (!userId) return fallback();

      const db = event.locals.db;
      const existingUser = await db.select().from(user).where(eq(user.id, userId)).get();
      if (!existingUser) return fallback();

      const shouldReadTerms =
        !existingUser.termsAccepted || existingUser.termsAccepted < termRevised;

      return { mode: shouldReadTerms ? ("accept" as const) : undefined };
    }
    default: {
      return fallback();
    }
  }
};

export const actions: Actions = {
  async default(event) {
    const userId = event.locals.user?.id;
    if (!userId) return err({ reason: "NOT_LOGGED_IN" });

    const db = event.locals.db;
    const res = await db.update(user).set({ id: userId, termsAccepted: new Date(Date.now()) });

    if (res.success) throw redirectBack(event, 302);
  }
};
