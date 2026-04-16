"use client";

import { useState } from "react";
import { useAIAssist } from "@/hooks/use-ai-assist";
import { CATEGORIES } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";

const INDUSTRIES = [
  { value: "general", label: "General" },
  { value: "medical_device", label: "Medical Device" },
  { value: "oem", label: "OEM / Manufacturing" },
  { value: "network_equipment", label: "Network Equipment" },
];

interface AIGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (content: string, metadata?: { title: string; description: string }) => void;
}

export function AIGenerateDialog({
  open,
  onOpenChange,
  onInsert,
}: AIGenerateDialogProps) {
  const [prompt, setPrompt] = useState("");
  const [industry, setIndustry] = useState("general");
  const [category, setCategory] = useState("General");
  const [copied, setCopied] = useState(false);

  const { isLoading, error, streamingContent, generatePlaybook, reset } =
    useAIAssist();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    const result = await generatePlaybook(prompt, { industry, category });
    if (result) {
      // Keep dialog open so user can review before inserting
    }
  };

  const handleInsert = () => {
    if (streamingContent) {
      const titleMatch = streamingContent.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1].trim() : "Generated Playbook";
      onInsert(streamingContent, { title, description: "" });
      handleClose();
    }
  };

  const handleCopy = async () => {
    if (streamingContent) {
      await navigator.clipboard.writeText(streamingContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    reset();
    setPrompt("");
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Generate Playbook with AI
          </DialogTitle>
          <DialogDescription>
            Describe what playbook you need and AI will generate a complete draft.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-auto">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Describe the playbook you need
            </label>
            <Textarea
              placeholder="e.g., Cisco Webex Room Kit Pro deployment guide for a 20-person conference room with dual displays and SIP registration"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Industry</label>
              <Select
                value={industry}
                onValueChange={setIndustry}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind.value} value={ind.value}>
                      {ind.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={category}
                onValueChange={setCategory}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
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
          </div>

          {!streamingContent && !isLoading && (
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isLoading}
              className="w-full"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Playbook
            </Button>
          )}

          {(isLoading || streamingContent) && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                {isLoading && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-600" />
                )}
                <span>
                  {isLoading ? "Generating..." : "Generation complete"}
                </span>
              </div>
              <pre className="max-h-64 overflow-auto whitespace-pre-wrap text-xs font-mono leading-relaxed">
                {streamingContent}
              </pre>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        {streamingContent && !isLoading && (
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <Check className="mr-1.5 h-3 w-3" />
              ) : (
                <Copy className="mr-1.5 h-3 w-3" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button size="sm" onClick={handleInsert}>
              Insert into Editor
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
