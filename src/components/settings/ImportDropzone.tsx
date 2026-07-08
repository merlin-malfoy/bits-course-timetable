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
      className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-foreground/25 p-8 text-center hover:border-foreground/40"
    >
      <p className="text-sm font-medium">Drop a .xlsx or .csv course list here, or click to browse</p>
      <p className="text-xs text-foreground/50">
        Columns: Code, Title, Credits, CategoryType, Department, Branches, SemesterParity, Instructors, Notes,
        Categories
      </p>
      <p className="text-xs text-foreground/40">
        Numbers files aren&apos;t supported — export to Excel first (File &gt; Export To &gt; Excel).
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
