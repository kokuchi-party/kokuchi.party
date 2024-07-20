import type { Cookies } from "@sveltejs/kit";

export type CookieOptions = Parameters<Cookies["set"]>[2];
