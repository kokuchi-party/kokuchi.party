export type AuthAction = "login" | "register" | "link";

export function isAuthAction(value: string | null | undefined): value is AuthAction {
  if (!value) return false;
  return (["login", "register", "link"] as const).includes(value);
}
