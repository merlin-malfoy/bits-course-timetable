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
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-semibold">How are you, {profile.name}?</h1>
        <div className="flex gap-3">
          <button
            onClick={handleContinue}
            className="rounded-md bg-accent px-5 py-2 text-sm font-medium text-accent-contrast transition-opacity hover:opacity-90"
          >
            Continue
          </button>
          <button
            onClick={() => setEditing(true)}
            className="rounded-md px-5 py-2 text-sm font-medium text-foreground/60 underline-offset-4 hover:text-foreground hover:underline"
          >
            Not you? Change name
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-4">
      <h1 className="text-2xl font-semibold">How are you? What&apos;s your name?</h1>
      <input
        autoFocus
        value={nameInput}
        onChange={(e) => setNameInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleContinue()}
        placeholder="Your name"
        className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-center text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/40"
      />
      <select
        value={branchInput}
        onChange={(e) => setBranchInput(e.target.value)}
        className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-center text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/40"
      >
        {branches.map((branch) => (
          <option key={branch.code} value={branch.code}>
            {branch.name} ({branch.code})
          </option>
        ))}
      </select>
      <button
        onClick={handleContinue}
        disabled={!nameInput.trim()}
        className="rounded-md bg-accent px-5 py-2 text-sm font-medium text-accent-contrast transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        Continue
      </button>
    </div>
  );
}
