import { eq } from "drizzle-orm";

import { err } from "$lib";
import { termRevised } from "$lib/constants";
import { redirectBack } from "$lib/server/auth";
import { user } from "$schema";

import type { Actions, PageServerLoad } from "./$types";

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
