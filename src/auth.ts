import { SvelteKitAuth } from "@auth/sveltekit";
import { UnstorageAdapter } from "@auth/unstorage-adapter";
import { createStorage } from "unstorage";
import cloudflareKVBindingDriver, { type KVOptions } from "unstorage/drivers/cloudflare-kv-binding";
import Google from "@auth/sveltekit/providers/google";

export const { handle, signIn, signOut } = SvelteKitAuth(async ({ platform }) => {
  const storage = createStorage({
    driver: cloudflareKVBindingDriver({
      binding: platform?.env.KV as unknown as KVOptions["binding"]
    })
  });

  return {
    adapter: UnstorageAdapter(storage),
    providers: [Google]
  };
});
