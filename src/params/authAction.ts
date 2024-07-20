import { isAuthAction } from "$lib/common/auth";

export function match(param) {
  return isAuthAction(param);
}
