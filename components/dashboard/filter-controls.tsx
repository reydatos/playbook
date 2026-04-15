"use client";

import { CATEGORIES, PLAYBOOK_STATUSES } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterControlsProps {
  category: string;
  status: string;
  sortBy: string;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

export function FilterControls({
  category,
  status,
  sortBy,
  onCategoryChange,
  onStatusChange,
  onSortChange,
}: FilterControlsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {PLAYBOOK_STATUSES.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="updated">Last Updated</SelectItem>
          <SelectItem value="created">Date Created</SelectItem>
          <SelectItem value="title">Title (A-Z)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
