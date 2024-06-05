import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { Adapter, DatabaseSession, DatabaseUser } from "lucia";
import { eq } from "drizzle-orm";

import { user } from "$schema";
import { forEachKeyByPrefix } from "$lib/kv.server";

type Key = `session:${string}` | `session-by:${string}:${string}`;

const Key = {
  session: (id: string) => `session:${id}`,
  sessionByUser: (userId: string, sessionId: string) => `session-by:${userId}:${sessionId}`
} as const satisfies Record<string, (...args: string[]) => Key>;

const Prefix = {
  sessionByUser: (userId: string) => `session-by:${userId}`
} as const;

const unix = (date: Date) => Math.floor(date.getTime() / 1000);

export class D1KVAdapter implements Adapter {
  private db: DrizzleD1Database;
  private kv: KVNamespace<Key>;

  constructor(db: DrizzleD1Database, kv: KVNamespace) {
    this.db = db;
    this.kv = kv as unknown as KVNamespace<Key>;
  }

  async deleteExpiredSessions(): Promise<void> {
    // Expiration is handled by Cloudflare KV
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.kv.delete(Key.session(sessionId));
  }

  async deleteUserSessions(userId: string): Promise<void> {
    await forEachKeyByPrefix(this.kv, Prefix.sessionByUser(userId), (key) => this.kv.delete(key));
  }

  async getSessionAndUser(
    sessionId: string
  ): Promise<[session: DatabaseSession | null, user: DatabaseUser | null]> {
    const session = await this.kv.get<DatabaseSession>(Key.session(sessionId), "json");
    if (!session) return [null, null];

    const attributes = await this.db.select().from(user).where(eq(user.id, session.userId)).get();
    if (!attributes) return [session, null];
    session.expiresAt = new Date(session.expiresAt);

    return [session, { id: session.userId, attributes }];
  }

  async getUserSessions(userId: string): Promise<DatabaseSession[]> {
    return forEachKeyByPrefix(this.kv, Prefix.sessionByUser(userId), async (key) => {
      const session = await this.kv.get<DatabaseSession>(key, "json");
      if (session) {
        session.expiresAt = new Date(session.expiresAt);
        return session;
      }
    });
  }

  async setSession(session: DatabaseSession): Promise<void> {
    const sessionJson = JSON.stringify(session);
    await Promise.all([
      this.kv.put(Key.session(session.id), sessionJson, {
        expiration: unix(session.expiresAt)
      }),
      this.kv.put(Key.sessionByUser(session.userId, session.id), sessionJson, {
        expiration: unix(session.expiresAt)
      })
    ]);
  }

  async updateSessionExpiration(sessionId: string, expiresAt: Date): Promise<void> {
    const sessionKey = Key.session(sessionId);
    const session = await this.kv.get<DatabaseSession>(sessionKey, "json");
    if (session) {
      const sessionJson = JSON.stringify(session);
      const sessionByUserKey = Key.sessionByUser(session.userId, sessionId);
      await Promise.all([
        this.kv.put(sessionKey, sessionJson, { expiration: unix(expiresAt) }),
        this.kv.put(sessionByUserKey, sessionJson, { expiration: unix(expiresAt) })
      ]);
    }
  }
}
