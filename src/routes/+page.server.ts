import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  const { user } = event.locals;
  return { user };
};
