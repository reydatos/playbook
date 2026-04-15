"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { usePlaybooks } from "@/hooks/use-playbooks";
import { useAuth } from "@/hooks/use-auth";
import { useDebounce } from "@/hooks/use-debounce";
import { Topbar } from "@/components/layout/topbar";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { SearchBar } from "@/components/dashboard/search-bar";
import { FilterControls } from "@/components/dashboard/filter-controls";
import { PlaybookCard } from "@/components/dashboard/playbook-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Search } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { canEdit } = useAuth();
  const { playbooks, isLoading } = usePlaybooks();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("updated");

  const debouncedSearch = useDebounce(search, 300);

  const filtered = useMemo(() => {
    let result = [...playbooks];

    // Search filter
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (category !== "all") {
      result = result.filter((p) => p.category === category);
    }

    // Status filter
    if (status !== "all") {
      result = result.filter((p) => p.status === status);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "updated":
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case "created":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return result;
  }, [playbooks, debouncedSearch, category, status, sortBy]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading playbooks...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Topbar title="Dashboard" description="Manage your customer playbooks">
        {canEdit && (
          <Button onClick={() => router.push("/playbooks/new")} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Playbook
          </Button>
        )}
      </Topbar>

      <div className="flex-1 space-y-6 p-6">
        <StatsOverview playbooks={playbooks} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-xs">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <FilterControls
            category={category}
            status={status}
            sortBy={sortBy}
            onCategoryChange={setCategory}
            onStatusChange={setStatus}
            onSortChange={setSortBy}
          />
        </div>

        {filtered.length === 0 ? (
          playbooks.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No playbooks yet"
              description="Create your first playbook to get started with technical documentation."
              actionLabel={canEdit ? "Create Playbook" : undefined}
              onAction={
                canEdit ? () => router.push("/playbooks/new") : undefined
              }
            />
          ) : (
            <EmptyState
              icon={Search}
              title="No matching playbooks"
              description="Try adjusting your search or filters to find what you're looking for."
            />
          )
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((playbook) => (
              <PlaybookCard key={playbook.id} playbook={playbook} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
