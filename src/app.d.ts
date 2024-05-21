import type { D1Database, KVNamespace } from "@cloudflare/workers-types";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { Storage } from "unstorage";

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      db: DrizzleD1Database;
      kv: Storage;
    }
    // interface PageData {}
    // interface PageState {}
    interface Platform {
      env: {
        DB: D1Database;
        KV: KVNamespace;
        DKIM_PRIVATE_KEY: string;
      };
      context: {
        waitUntil(promise: Promise<unknown>): void;
      };
      caches?: CacheStorage & { default: Cache };
    }
  }
}

export {};
