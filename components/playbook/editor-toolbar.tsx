"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { VoiceRecorder } from "./voice-recorder";
import {
  Bold,
  Italic,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link,
  Table,
  Quote,
  Minus,
  CheckSquare,
  Terminal,
  Sparkles,
} from "lucide-react";

interface EditorToolbarProps {
  onInsert: (before: string, after?: string) => void;
  onAIInsert?: (content: string) => void;
  onGenerateClick?: () => void;
  aiAvailable?: boolean;
}

export function EditorToolbar({
  onInsert,
  onAIInsert,
  onGenerateClick,
  aiAvailable,
}: EditorToolbarProps) {
  const tools = [
    { icon: Heading1, label: "Heading 1", before: "# ", after: "" },
    { icon: Heading2, label: "Heading 2", before: "## ", after: "" },
    { icon: Heading3, label: "Heading 3", before: "### ", after: "" },
    { type: "separator" as const },
    { icon: Bold, label: "Bold", before: "**", after: "**" },
    { icon: Italic, label: "Italic", before: "_", after: "_" },
    { icon: Code, label: "Inline Code", before: "`", after: "`" },
    { type: "separator" as const },
    { icon: List, label: "Bullet List", before: "- ", after: "" },
    { icon: ListOrdered, label: "Numbered List", before: "1. ", after: "" },
    {
      icon: CheckSquare,
      label: "Task List",
      before: "- [ ] ",
      after: "",
    },
    { type: "separator" as const },
    {
      icon: Terminal,
      label: "Code Block",
      before: "```bash\n",
      after: "\n```",
    },
    { icon: Quote, label: "Blockquote", before: "> ", after: "" },
    { icon: Link, label: "Link", before: "[", after: "](url)" },
    {
      icon: Table,
      label: "Table",
      before:
        "| Header | Header | Header |\n|--------|--------|--------|\n| Cell   | Cell   | Cell   |\n",
      after: "",
    },
    { icon: Minus, label: "Horizontal Rule", before: "\n---\n", after: "" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 px-2 py-1.5">
      {tools.map((tool, i) => {
        if ("type" in tool && tool.type === "separator") {
          return (
            <Separator key={i} orientation="vertical" className="mx-1 h-6" />
          );
        }
        const { icon: Icon, label, before, after } = tool as {
          icon: typeof Bold;
          label: string;
          before: string;
          after: string;
        };
        return (
          <Button
            key={label}
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title={label}
            onClick={() => onInsert(before, after)}
            type="button"
          >
            <Icon className="h-3.5 w-3.5" />
          </Button>
        );
      })}

      {/* AI Features */}
      <Separator orientation="vertical" className="mx-1 h-6" />

      {onAIInsert && (
        <VoiceRecorder onInsert={onAIInsert} aiAvailable={aiAvailable} />
      )}

      {aiAvailable && onGenerateClick && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-purple-600 hover:text-purple-700"
          title="Generate with AI"
          onClick={onGenerateClick}
          type="button"
        >
          <Sparkles className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
