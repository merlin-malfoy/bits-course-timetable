import { getDb } from "@/lib/db/db";
import type { BranchRepository } from "@/lib/db/interfaces";
import type { Branch } from "@/types/branch";

export const branchRepository: BranchRepository = {
  async getAll() {
    const db = await getDb();
    return db.getAll("branches");
  },

  async getByCode(code) {
    const db = await getDb();
    return db.get("branches", code);
  },

  async bulkUpsert(branches: Branch[]) {
    const db = await getDb();
    const tx = db.transaction("branches", "readwrite");
    await Promise.all([...branches.map((branch) => tx.store.put(branch)), tx.done]);
  },
};
