import { getDb } from "@/lib/db/db";
import type { UserRepository } from "@/lib/db/interfaces";
import type { UserProfile } from "@/types/user";

export const LOCAL_USER_ID = "local-user";

export const userRepository: UserRepository = {
  async get() {
    const db = await getDb();
    return db.get("userProfile", LOCAL_USER_ID);
  },

  async upsert(profile: UserProfile) {
    const db = await getDb();
    await db.put("userProfile", profile);
  },
};
