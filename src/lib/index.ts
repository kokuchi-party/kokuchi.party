export type Result<T, U = unknown> = ({ ok: true } & T) | ({ ok: false } & U);
