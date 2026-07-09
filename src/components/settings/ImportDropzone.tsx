"use client";

import { useRef } from "react";

interface ImportDropzoneProps {
  onFileSelected: (file: File) => void;
  isBusy: boolean;
}

export function ImportDropzone({ onFileSelected, isBusy }: ImportDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) onFileSelected(file);
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-foreground/25 bg-surface p-8 text-center hover:border-accent/50"
    >
      <p className="font-mono text-sm font-medium">drop a .xlsx or .csv course list here, or click to browse</p>
      <p className="font-mono text-xs text-foreground/60">
        columns: code, title, credits, categorytype, department, branches, semesterparity, instructors, notes,
        categories
      </p>
      <p className="font-mono text-xs text-foreground/60">
        numbers files aren&apos;t supported — export to Excel first (File &gt; Export To &gt; Excel).
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.csv"
        disabled={isBusy}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
