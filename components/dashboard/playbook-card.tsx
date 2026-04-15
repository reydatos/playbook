"use client";

import Link from "next/link";
import { Playbook } from "@/lib/types";
import { PLAYBOOK_STATUSES } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText } from "lucide-react";

interface PlaybookCardProps {
  playbook: Playbook;
}

export function PlaybookCard({ playbook }: PlaybookCardProps) {
  const statusConfig = PLAYBOOK_STATUSES.find(
    (s) => s.value === playbook.status
  );

  const badgeVariant =
    playbook.status === "published"
      ? "success"
      : playbook.status === "draft"
      ? "warning"
      : "secondary";

  return (
    <Link href={`/playbooks/${playbook.id}`}>
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/30 cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                {playbook.title}
              </h3>
            </div>
            <Badge variant={badgeVariant} className="flex-shrink-0 text-[10px]">
              {statusConfig?.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {playbook.description}
          </p>
        </CardContent>

        <CardFooter className="flex flex-col items-start gap-2 pt-0">
          <div className="flex flex-wrap gap-1">
            {playbook.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                {tag}
              </Badge>
            ))}
            {playbook.tags.length > 3 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                +{playbook.tags.length - 3}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Updated {formatRelativeTime(playbook.updatedAt)}</span>
            {playbook.versions.length > 0 && (
              <span className="ml-1">
                · {playbook.versions.length} version
                {playbook.versions.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
