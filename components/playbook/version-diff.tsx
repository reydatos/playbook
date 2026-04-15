"use client";

import { useMemo } from "react";
import { diffLines, Change } from "diff";

interface VersionDiffProps {
  oldContent: string;
  newContent: string;
}

export function VersionDiff({
  oldContent,
  newContent,
}: VersionDiffProps) {
  const changes = useMemo(
    () => diffLines(oldContent, newContent),
    [oldContent, newContent]
  );

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    changes.forEach((change) => {
      const lines = change.value.split("\n").filter(Boolean).length;
      if (change.added) added += lines;
      if (change.removed) removed += lines;
    });
    return { added, removed };
  }, [changes]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b px-4 py-2 bg-muted/30">
        <div className="flex items-center gap-4 text-xs">
          <span className="font-medium text-muted-foreground">Changes:</span>
          <span className="text-green-600">+{stats.added} added</span>
          <span className="text-red-600">-{stats.removed} removed</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <pre className="text-xs font-mono leading-relaxed">
          {changes.map((change, i) => (
            <DiffBlock key={i} change={change} />
          ))}
        </pre>
      </div>
    </div>
  );
}

function DiffBlock({ change }: { change: Change }) {
  const lines = change.value.split("\n");
  // Remove trailing empty line from split
  if (lines[lines.length - 1] === "") lines.pop();

  if (!change.added && !change.removed) {
    return (
      <>
        {lines.map((line, i) => (
          <div key={i} className="px-4 py-0.5">
            <span className="inline-block w-6 text-muted-foreground select-none">
              {" "}
            </span>
            {line}
          </div>
        ))}
      </>
    );
  }

  const bgClass = change.added
    ? "bg-green-50 text-green-800"
    : "bg-red-50 text-red-800";
  const prefix = change.added ? "+" : "-";

  return (
    <>
      {lines.map((line, i) => (
        <div key={i} className={`px-4 py-0.5 ${bgClass}`}>
          <span className="inline-block w-6 font-bold select-none">
            {prefix}
          </span>
          {line}
        </div>
      ))}
    </>
  );
}
