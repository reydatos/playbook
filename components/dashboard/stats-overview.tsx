"use client";

import { Playbook } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, FileCheck, FilePen, Archive } from "lucide-react";

interface StatsOverviewProps {
  playbooks: Playbook[];
}

export function StatsOverview({ playbooks }: StatsOverviewProps) {
  const total = playbooks.length;
  const published = playbooks.filter((p) => p.status === "published").length;
  const drafts = playbooks.filter((p) => p.status === "draft").length;
  const archived = playbooks.filter((p) => p.status === "archived").length;

  const stats = [
    {
      label: "Total Playbooks",
      value: total,
      icon: BookOpen,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Published",
      value: published,
      icon: FileCheck,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Drafts",
      value: drafts,
      icon: FilePen,
      color: "text-yellow-600 bg-yellow-50",
    },
    {
      label: "Archived",
      value: archived,
      icon: Archive,
      color: "text-gray-600 bg-gray-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="flex items-center gap-4 p-4">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}
            >
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
