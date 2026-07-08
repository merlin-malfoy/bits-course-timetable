import { create } from "zustand";
import type { UserProfile } from "@/types/user";
import type { Branch } from "@/types/branch";
import { userRepository, LOCAL_USER_ID } from "@/lib/db/repositories/userRepository";
import { branchRepository } from "@/lib/db/repositories/branchRepository";
import { seedIfEmpty } from "@/lib/db/seed";
import { DEFAULT_CALENDAR_ID, DEFAULT_THEME_ID } from "@/lib/constants";

interface AppState {
  isHydrated: boolean;
  profile: UserProfile | null;
  branches: Branch[];
  hydrate: () => Promise<void>;
  setName: (name: string) => Promise<void>;
  setBranch: (branchCode: string) => Promise<void>;
  setTheme: (themeId: string) => Promise<void>;
  setSelectedMinor: (minorId: string | null) => Promise<void>;
}

function profileWithDefaults(current: UserProfile | null, patch: Partial<UserProfile>): UserProfile {
  return {
    id: LOCAL_USER_ID,
    name: "",
    branchCode: "A7",
    activeCalendarId: DEFAULT_CALENDAR_ID,
    themeId: DEFAULT_THEME_ID,
    createdAt: new Date().toISOString(),
    ...current,
    ...patch,
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  isHydrated: false,
  profile: null,
  branches: [],

  async hydrate() {
    await seedIfEmpty();
    const [profile, branches] = await Promise.all([userRepository.get(), branchRepository.getAll()]);
    set({ profile: profile ?? null, branches, isHydrated: true });
  },

  async setName(name: string) {
    const next = profileWithDefaults(get().profile, { name });
    set({ profile: next });
    await userRepository.upsert(next);
  },

  async setBranch(branchCode: string) {
    const next = profileWithDefaults(get().profile, { branchCode });
    set({ profile: next });
    await userRepository.upsert(next);
  },

  async setTheme(themeId: string) {
    const next = profileWithDefaults(get().profile, { themeId });
    set({ profile: next });
    await userRepository.upsert(next);
  },

  async setSelectedMinor(minorId: string | null) {
    const next = profileWithDefaults(get().profile, { selectedMinorId: minorId ?? undefined });
    set({ profile: next });
    await userRepository.upsert(next);
  },
}));
