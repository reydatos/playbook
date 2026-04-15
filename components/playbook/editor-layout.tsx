"use client";

import { useState, useCallback } from "react";
import { MarkdownEditor } from "./editor";
import { MarkdownPreview } from "./preview";
import { EditorToolbar } from "./editor-toolbar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Columns, FileText, Eye } from "lucide-react";

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

  // We'll pass inserts directly via the content prop
  const handleInsert = useCallback(
    (before: string, after: string = "") => {
      // For simplicity without direct CM view access from here,
      // we insert at end of content. In the full implementation,
      // the editor component would expose an imperative handle.
      const insert = `${before}${after}`;
      onChange(content + insert);
    },
    [content, onChange]
  );

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border">
      <div className="flex items-center justify-between border-b">
        {!readOnly && <EditorToolbar onInsert={handleInsert} />}
        <div className="flex items-center gap-2 px-2 py-1">
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
        {(viewMode === "editor" || viewMode === "split") && (
          <div
            className={`${
              viewMode === "split" ? "w-1/2 border-r" : "w-full"
            } overflow-hidden`}
          >
            <MarkdownEditor
              value={content}
              onChange={onChange}
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
    </div>
  );
}
