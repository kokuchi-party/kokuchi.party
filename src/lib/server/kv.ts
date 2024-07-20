/*
  Copyright (c) 2024 kokuchi.party

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
  OR OTHER DEALINGS IN THE SOFTWARE.
*/

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
