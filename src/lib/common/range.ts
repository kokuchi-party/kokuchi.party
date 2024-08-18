type Enumerate<N extends number, Acc extends number[] = []> = Acc["length"] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc["length"]]>;

export type RangedNumber<Start extends number, Stop extends number> = Exclude<
  Enumerate<Stop>,
  Enumerate<Start>
>;

export function within<const Start extends number, const Stop extends number>(
  n: number,
  { start, stop }: { start: Start; stop: Stop }
): n is RangedNumber<Start, Stop> {
  return start <= n && n < stop;
}
