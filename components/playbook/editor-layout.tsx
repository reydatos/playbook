"use client";

import { useState, useRef, useCallback } from "react";
import { MarkdownEditor, MarkdownEditorHandle } from "./editor";
import { MarkdownPreview } from "./preview";
import { EditorToolbar } from "./editor-toolbar";
import { AIAssistPanel } from "./ai-assist-panel";
import { AIGenerateDialog } from "./ai-generate-dialog";
import { useAIAvailability } from "@/hooks/use-ai-availability";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Columns, FileText, Eye, Bot } from "lucide-react";

type ViewMode = "split" | "editor" | "preview";

interface EditorLayoutProps {
  content: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
}

export function EditorLayout({
  content,
  onChange,
  readOnly = false,
}: EditorLayoutProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [selection, setSelection] = useState("");
  const editorRef = useRef<MarkdownEditorHandle>(null);
  const { aiAvailable } = useAIAvailability();

  const handleInsert = useCallback(
    (before: string, after: string = "") => {
      if (editorRef.current) {
        const selected = editorRef.current.getSelection();
        const text = `${before}${selected}${after}`;
        editorRef.current.replaceSelection(text);
      } else {
        onChange(content + before + after);
      }
    },
    [content, onChange]
  );

  const handleAIInsert = useCallback(
    (text: string) => {
      if (editorRef.current) {
        editorRef.current.insertText("\n\n" + text);
      } else {
        onChange(content + "\n\n" + text);
      }
    },
    [content, onChange]
  );

  const handleAIReplace = useCallback(
    (text: string) => {
      if (editorRef.current) {
        editorRef.current.replaceSelection(text);
      }
    },
    []
  );

  const handleGenerateInsert = useCallback(
    (generatedContent: string) => {
      onChange(generatedContent);
    },
    [onChange]
  );

  return (
    <>
      <div className="flex h-full flex-col overflow-hidden rounded-lg border">
        <div className="flex items-center justify-between border-b">
          {!readOnly && (
            <EditorToolbar
              onInsert={handleInsert}
              onAIInsert={handleAIInsert}
              onGenerateClick={() => setShowGenerateDialog(true)}
              aiAvailable={aiAvailable}
            />
          )}
          <div className="flex items-center gap-1 px-2 py-1">
            {aiAvailable && !readOnly && (
              <Button
                variant={showAIPanel ? "secondary" : "ghost"}
                size="icon"
                className="h-7 w-7"
                title="AI Assist"
                onClick={() => setShowAIPanel(!showAIPanel)}
                type="button"
              >
                <Bot className="h-3.5 w-3.5 text-purple-600" />
              </Button>
            )}
            <Tabs
              value={viewMode}
              onValueChange={(v) => setViewMode(v as ViewMode)}
            >
              <TabsList className="h-8">
                <TabsTrigger value="editor" className="h-6 px-2 text-xs">
                  <FileText className="mr-1 h-3 w-3" />
                  Editor
                </TabsTrigger>
                <TabsTrigger value="split" className="h-6 px-2 text-xs">
                  <Columns className="mr-1 h-3 w-3" />
                  Split
                </TabsTrigger>
                <TabsTrigger value="preview" className="h-6 px-2 text-xs">
                  <Eye className="mr-1 h-3 w-3" />
                  Preview
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main editor + preview area */}
          <div className="flex flex-1 overflow-hidden">
            {(viewMode === "editor" || viewMode === "split") && (
              <div
                className={`${
                  viewMode === "split" ? "w-1/2 border-r" : "w-full"
                } overflow-hidden`}
              >
                <MarkdownEditor
                  ref={editorRef}
                  value={content}
                  onChange={onChange}
                  onSelectionChange={setSelection}
                  readOnly={readOnly}
                />
              </div>
            )}

            {(viewMode === "preview" || viewMode === "split") && (
              <div
                className={`${
                  viewMode === "split" ? "w-1/2" : "w-full"
                } overflow-hidden bg-white`}
              >
                <MarkdownPreview content={content} />
              </div>
            )}
          </div>

          {/* AI Assist Panel */}
          {showAIPanel && !readOnly && (
            <div className="w-72 shrink-0">
              <AIAssistPanel
                content={content}
                selection={selection}
                onInsert={handleAIInsert}
                onReplace={handleAIReplace}
              />
            </div>
          )}
        </div>
      </div>

      <AIGenerateDialog
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
        onInsert={handleGenerateInsert}
      />
    </>
  );
}
