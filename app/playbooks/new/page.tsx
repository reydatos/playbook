"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { usePlaybooks } from "@/hooks/use-playbooks";
import { PlaybookFormData } from "@/lib/types";
import { Topbar } from "@/components/layout/topbar";
import { MetadataForm } from "@/components/playbook/metadata-form";
import { EditorLayout } from "@/components/playbook/editor-layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";

const defaultContent = `# Playbook Title

## Overview

Provide a brief overview of this playbook's purpose and scope.

## Prerequisites

- Requirement 1
- Requirement 2

## Steps

### Step 1: Getting Started

Describe the first step here.

\`\`\`bash
# Example command
echo "Hello, World!"
\`\`\`

### Step 2: Configuration

Describe configuration steps.

| Setting | Value | Description |
|---------|-------|-------------|
| timeout | 30s | Request timeout |
| retries | 3 | Max retry attempts |

## Troubleshooting

### Common Issues

> **Note:** Document common issues and their solutions here.

## References

- [Link 1](https://example.com)
`;

export default function NewPlaybookPage() {
  const router = useRouter();
  const { user, canEdit } = useAuth();
  const { create } = usePlaybooks();

  const [formData, setFormData] = useState<PlaybookFormData>({
    title: "",
    description: "",
    content: defaultContent,
    category: "General",
    tags: [],
    status: "draft",
  });

  const handleCreate = () => {
    if (!user || !formData.title.trim()) return;
    const playbook = create(formData, user.id);
    if (playbook) {
      router.push(`/playbooks/${playbook.id}`);
    }
  };

  if (!canEdit) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">
          You don&apos;t have permission to create playbooks.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Topbar title="New Playbook" description="Create a new technical playbook">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          size="sm"
          onClick={handleCreate}
          disabled={!formData.title.trim()}
        >
          <Save className="mr-2 h-4 w-4" />
          Create Playbook
        </Button>
      </Topbar>

      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <MetadataForm
            data={formData}
            onChange={(updates) =>
              setFormData((prev) => ({ ...prev, ...updates }))
            }
          />
        </div>

        <div className="h-[600px]">
          <EditorLayout
            content={formData.content}
            onChange={(content) =>
              setFormData((prev) => ({ ...prev, content }))
            }
          />
        </div>
      </div>
    </div>
  );
}
