"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/state/useAppStore";

export function NameForm() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const branches = useAppStore((s) => s.branches);
  const setName = useAppStore((s) => s.setName);
  const setBranch = useAppStore((s) => s.setBranch);

  const [editing, setEditing] = useState(!profile?.name);
  const [nameInput, setNameInput] = useState(profile?.name ?? "");
  const [branchInput, setBranchInput] = useState(profile?.branchCode ?? "A7");

  async function handleContinue() {
    if (editing) {
      const trimmed = nameInput.trim();
      if (!trimmed) return;
      await setName(trimmed);
      await setBranch(branchInput);
      setEditing(false);
    }
    router.push("/overview");
  }

  if (!editing && profile?.name) {
    return (
      <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-lg border border-foreground/15 bg-surface p-6">
        <p className="w-full font-mono text-xs text-foreground/60">
          <span className="text-accent">{">"}</span> whoami
        </p>
        <h1 className="w-full font-mono text-xl font-semibold">{profile.name}</h1>
        <div className="flex w-full gap-2">
          <button
            onClick={handleContinue}
            className="flex-1 rounded-md bg-accent px-5 py-2 font-mono text-sm font-medium text-accent-contrast transition-opacity hover:opacity-90"
          >
            Continue →
          </button>
          <button
            onClick={() => setEditing(true)}
            className="rounded-md border border-foreground/15 px-4 py-2 font-mono text-sm font-medium text-foreground/70 transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            Not you?
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-xs flex-col gap-4 rounded-lg border border-foreground/15 bg-surface p-6">
      <p className="font-mono text-xs text-foreground/60">
        <span className="text-accent">{">"}</span> register --student
      </p>
      <label className="flex flex-col gap-1.5 font-mono text-xs text-foreground/60">
        name
        <input
          autoFocus
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleContinue()}
          placeholder="your name"
          className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/40"
        />
      </label>
      <label className="flex flex-col gap-1.5 font-mono text-xs text-foreground/60">
        branch
        <select
          value={branchInput}
          onChange={(e) => setBranchInput(e.target.value)}
          className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/40"
        >
          {branches.map((branch) => (
            <option key={branch.code} value={branch.code}>
              {branch.name} ({branch.code})
            </option>
          ))}
        </select>
      </label>
      <button
        onClick={handleContinue}
        disabled={!nameInput.trim()}
        className="rounded-md bg-accent px-5 py-2 font-mono text-sm font-medium text-accent-contrast transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        Continue →
      </button>
    </div>
  );
}
