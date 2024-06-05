export type Result<T, U = unknown> = ({ ok: true } & T) | ({ ok: false } & U);

export const ok = <T extends object, U = never>(value: T) =>
  ({ ...value, ok: true }) as Result<T, U>;

export const err = <U extends object, T = never>(value: U) =>
  ({ ...value, ok: false }) as Result<T, U>;

export function notNullOrUndefined<T>(x: T | null | undefined): x is T {
  return x !== null && x !== undefined;
}

export const forEachAsync = <T, U>(xs: T[], promise: (x: T) => Promise<U | null | undefined>) =>
  Promise.all(xs.map((x) => promise(x))).then((ys) => ys.filter(notNullOrUndefined));
