"use client";

import { PlaybookFormData } from "@/lib/types";
import { CATEGORIES, PLAYBOOK_STATUSES } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { useState } from "react";

interface MetadataFormProps {
  data: PlaybookFormData;
  onChange: (data: Partial<PlaybookFormData>) => void;
  readOnly?: boolean;
}

export function MetadataForm({ data, onChange, readOnly }: MetadataFormProps) {
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !data.tags.includes(tag)) {
      onChange({ tags: [...data.tags, tag] });
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    onChange({ tags: data.tags.filter((t) => t !== tag) });
  };

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="title">
          Title
        </label>
        <Input
          id="title"
          placeholder="Playbook title"
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          disabled={readOnly}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="description">
          Description
        </label>
        <Textarea
          id="description"
          placeholder="Brief description of this playbook"
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={2}
          disabled={readOnly}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select
            value={data.category}
            onValueChange={(value) => onChange({ category: value })}
            disabled={readOnly}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <Select
            value={data.status}
            onValueChange={(value) =>
              onChange({ status: value as PlaybookFormData["status"] })
            }
            disabled={readOnly}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {PLAYBOOK_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Tags</label>
        <div className="flex gap-2">
          <Input
            placeholder="Add a tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            disabled={readOnly}
          />
        </div>
        {data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {data.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                {!readOnly && (
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-destructive"
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
