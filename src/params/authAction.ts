import { isAuthAction } from "$lib/auth";

export function match(param) {
  return isAuthAction(param);
}
