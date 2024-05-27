import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { drizzle } from "drizzle-orm/d1";
import { create } from "$lib/server/file";

export const actions: Actions = {
  upload: async ({ platform, request, locals }) => {
    const d1 = platform?.env.DB;
    if (!d1) return fail(500, { message: "DB initialization failure" });

    const user = locals.user;
    if (!user) return fail(400, { message: "Not authorized" });

    const data = await request.formData();
    const file = data.get("file");
    if (!file || typeof file === "string") return fail(400, { message: "The file is invalid" });

    const db = drizzle(d1);
    const res = await create(db, file);
    console.log(JSON.stringify(res));

    if (res.ok) return res;
    return fail(res.status, { message: res.message });
  }
};
