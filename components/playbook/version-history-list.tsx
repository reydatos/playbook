"use client";

import { PlaybookVersion } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw, Clock, Eye } from "lucide-react";

interface VersionHistoryListProps {
  versions: PlaybookVersion[];
  selectedId?: string;
  onSelect: (version: PlaybookVersion) => void;
  onRestore?: (version: PlaybookVersion) => void;
  canRestore?: boolean;
}

export function VersionHistoryList({
  versions,
  selectedId,
  onSelect,
  onRestore,
  canRestore = false,
}: VersionHistoryListProps) {
  if (versions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm font-medium">No version history yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Versions are created automatically when you save changes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {versions.map((version) => (
        <Card
          key={version.id}
          className={`cursor-pointer transition-colors ${
            selectedId === version.id
              ? "border-primary bg-primary/5"
              : "hover:bg-muted/50"
          }`}
          onClick={() => onSelect(version)}
        >
          <CardContent className="flex items-center justify-between p-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  v{version.versionNumber}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(version.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-sm font-medium truncate">
                {version.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {version.changeDescription}
              </p>
            </div>

            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(version);
                }}
                title="View this version"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>

              {canRestore && onRestore && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-blue-600 hover:text-blue-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestore(version);
                  }}
                  title="Restore this version"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
