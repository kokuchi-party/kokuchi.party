export const load = async ({ locals }) => {
  return {
    lang: locals.lang,
    loggedIn: !!locals.user
  };
};
