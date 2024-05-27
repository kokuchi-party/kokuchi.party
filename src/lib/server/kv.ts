import { forEachAsync } from "$lib";

export async function forEachKeyByPrefix<Key extends string = string, T = void>(
  kv: KVNamespace<Key>,
  prefix: string,
  f: (key: Key) => Promise<Awaited<T> | null | undefined>
): Promise<Awaited<T>[]> {
  let list = await kv.list({ prefix });
  const results: Awaited<T>[] = [];

  while (!list.list_complete) {
    const result = await forEachAsync(list.keys, ({ name }) => f(name));
    results.push(...result);
    list = await kv.list({ prefix, cursor: list.cursor });
  }

  return results;
}
