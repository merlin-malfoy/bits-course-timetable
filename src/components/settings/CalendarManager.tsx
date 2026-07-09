"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/state/useAppStore";
import { useCalendars } from "@/lib/state/useCalendars";
import { DEFAULT_CALENDAR_ID } from "@/lib/constants";

export function CalendarManager() {
  const calendars = useCalendars((s) => s.calendars);
  const createCalendar = useCalendars((s) => s.create);
  const renameCalendar = useCalendars((s) => s.rename);
  const removeCalendar = useCalendars((s) => s.remove);

  const activeCalendarId = useAppStore((s) => s.profile?.activeCalendarId) ?? DEFAULT_CALENDAR_ID;
  const setActiveCalendar = useAppStore((s) => s.setActiveCalendar);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [newName, setNewName] = useState("");
  const [duplicateFrom, setDuplicateFrom] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  function startRename(id: string, currentName: string) {
    setEditingId(id);
    setEditingName(currentName);
  }

  async function confirmRename() {
    if (!editingId) return;
    const trimmed = editingName.trim();
    if (trimmed) await renameCalendar(editingId, trimmed);
    setEditingId(null);
  }

  async function handleCreate() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setIsCreating(true);
    try {
      await createCalendar(trimmed, duplicateFrom || undefined);
      setNewName("");
      setDuplicateFrom("");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (id === activeCalendarId) {
      const fallback = calendars.find((c) => c.id !== id);
      if (fallback) await setActiveCalendar(fallback.id);
    }
    await removeCalendar(id);
    setPendingDeleteId(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {calendars.map((calendar) => {
          const isActive = calendar.id === activeCalendarId;
          const isEditing = editingId === calendar.id;
          const isPendingDelete = pendingDeleteId === calendar.id;

          return (
            <div
              key={calendar.id}
              className={`flex flex-wrap items-center gap-2 rounded-lg border p-2.5 font-mono text-sm ${
                isActive ? "border-accent/40 bg-accent/10" : "border-foreground/10"
              }`}
            >
              {isEditing ? (
                <input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && confirmRename()}
                  onBlur={confirmRename}
                  className="min-w-0 flex-1 rounded-md border border-foreground/20 bg-background px-2 py-1 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/40"
                />
              ) : (
                <span className="min-w-0 flex-1 truncate font-medium">{calendar.name}</span>
              )}

              {isActive && <span className="shrink-0 rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent">active</span>}

              <div className="flex shrink-0 flex-wrap gap-1.5">
                {!isActive && (
                  <button
                    onClick={() => setActiveCalendar(calendar.id)}
                    className="rounded-md border border-foreground/20 px-2 py-1 text-xs hover:bg-foreground/5"
                  >
                    switch to
                  </button>
                )}
                <button
                  onClick={() => startRename(calendar.id, calendar.name)}
                  className="rounded-md border border-foreground/20 px-2 py-1 text-xs hover:bg-foreground/5"
                >
                  rename
                </button>
                {isPendingDelete ? (
                  <>
                    <button
                      onClick={() => handleDelete(calendar.id)}
                      className="rounded-md border border-red-500/40 px-2 py-1 text-xs text-red-500 hover:bg-red-500/10"
                    >
                      confirm delete
                    </button>
                    <button
                      onClick={() => setPendingDeleteId(null)}
                      className="rounded-md border border-foreground/20 px-2 py-1 text-xs hover:bg-foreground/5"
                    >
                      cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setPendingDeleteId(calendar.id)}
                    disabled={calendars.length <= 1}
                    title={calendars.length <= 1 ? "you need at least one calendar" : undefined}
                    className="rounded-md border border-foreground/20 px-2 py-1 text-xs hover:bg-foreground/5 disabled:opacity-40"
                  >
                    delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-foreground/20 p-2.5 font-mono text-sm">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="new calendar name…"
          className="min-w-[10rem] flex-1 rounded-md border border-foreground/20 bg-background px-2 py-1.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/40"
        />
        <select
          value={duplicateFrom}
          onChange={(e) => setDuplicateFrom(e.target.value)}
          className="rounded-md border border-foreground/20 bg-background px-2 py-1.5 text-sm"
        >
          <option value="">start blank</option>
          {calendars.map((c) => (
            <option key={c.id} value={c.id}>
              copy from &quot;{c.name}&quot;
            </option>
          ))}
        </select>
        <button
          onClick={handleCreate}
          disabled={isCreating || !newName.trim()}
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-contrast hover:opacity-90 disabled:opacity-40"
        >
          {isCreating ? "creating…" : "+ create"}
        </button>
      </div>
    </div>
  );
}
