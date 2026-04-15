"use client";

import React, { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";

interface PreviewProps {
  content: string;
}

export const MarkdownPreview = memo(function MarkdownPreview({
  content,
}: PreviewProps) {
  if (!content.trim()) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p>Start typing to see a live preview...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6">
      <article className="prose prose-sm max-w-none prose-headings:scroll-mt-4 prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-code:text-blue-600 prose-code:before:content-none prose-code:after:content-none prose-a:text-blue-600 prose-table:text-sm">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeSlug]}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
});
