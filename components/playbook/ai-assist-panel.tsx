"use client";

import { useState } from "react";
import { useAIAssist } from "@/hooks/use-ai-assist";
import { AIAction } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MarkdownPreview } from "./preview";
import {
  Wand2,
  AlertTriangle,
  Search,
  FileText,
  Loader2,
  Copy,
  Check,
  Plus,
  Bot,
} from "lucide-react";

interface AIAssistPanelProps {
  content: string;
  selection: string;
  onInsert: (text: string) => void;
  onReplace?: (text: string) => void;
}

const actions = [
  {
    key: "improve" as AIAction,
    label: "Improve Selection",
    icon: Wand2,
    description: "Rewrite selected text for clarity",
    needsSelection: true,
  },
  {
    key: "troubleshoot" as AIAction,
    label: "Add Troubleshooting",
    icon: AlertTriangle,
    description: "Generate troubleshooting section",
    needsSelection: false,
  },
  {
    key: "detect-issues" as AIAction,
    label: "Detect Issues",
    icon: Search,
    description: "Review for missing steps and problems",
    needsSelection: false,
  },
  {
    key: "summarize" as AIAction,
    label: "Summarize",
    icon: FileText,
    description: "Auto-generate description",
    needsSelection: false,
  },
];

export function AIAssistPanel({
  content,
  selection,
  onInsert,
  onReplace,
}: AIAssistPanelProps) {
  const { isLoading, error, assistAction, reset } = useAIAssist();
  const [result, setResult] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<AIAction | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAction = async (action: AIAction) => {
    reset();
    setResult(null);
    setActiveAction(action);

    const res = await assistAction(action, content, selection);
    if (res) {
      setResult(res.result);
    }
  };

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInsert = () => {
    if (result) {
      onInsert(result);
    }
  };

  const handleReplace = () => {
    if (result && onReplace) {
      onReplace(result);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden border-l bg-card">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <Bot className="h-4 w-4 text-purple-600" />
        <span className="text-sm font-semibold">AI Assist</span>
      </div>

      <div className="space-y-1 p-2">
        {actions.map((action) => {
          const isDisabled =
            isLoading ||
            !content.trim() ||
            (action.needsSelection && !selection.trim());
          const isActive = activeAction === action.key && isLoading;

          return (
            <Button
              key={action.key}
              variant={activeAction === action.key ? "secondary" : "ghost"}
              size="sm"
              className="w-full justify-start text-xs"
              disabled={isDisabled}
              onClick={() => handleAction(action.key)}
            >
              {isActive ? (
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              ) : (
                <action.icon className="mr-2 h-3 w-3" />
              )}
              {action.label}
              {action.needsSelection && !selection.trim() && (
                <span className="ml-auto text-[10px] text-muted-foreground">
                  select text
                </span>
              )}
            </Button>
          );
        })}
      </div>

      <Separator />

      <div className="flex-1 overflow-auto p-3">
        {!result && !isLoading && !error && (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-xs text-muted-foreground">
              Select an action above to get AI assistance with your playbook.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Analyzing playbook...</span>
          </div>
        )}

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}

        {result && !isLoading && (
          <div className="space-y-3">
            <div className="max-h-80 overflow-auto rounded border bg-muted/30 p-2">
              <div className="prose prose-xs max-w-none text-xs">
                <MarkdownPreview content={result} />
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="mr-1 h-3 w-3" />
                ) : (
                  <Copy className="mr-1 h-3 w-3" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                size="sm"
                className="text-xs h-7"
                onClick={handleInsert}
              >
                <Plus className="mr-1 h-3 w-3" />
                Insert
              </Button>
              {activeAction === "improve" && onReplace && selection && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-xs h-7"
                  onClick={handleReplace}
                >
                  <Wand2 className="mr-1 h-3 w-3" />
                  Replace Selection
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
