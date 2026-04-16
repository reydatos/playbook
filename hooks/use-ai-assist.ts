"use client";

import { useState, useCallback, useRef } from "react";
import {
  AIStructureResult,
  AIGenerateResult,
  AIAssistResult,
  AIAction,
} from "@/lib/types";

export function useAIAssist() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState<string>("");
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setError(null);
    setStreamingContent("");
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  const structureContent = useCallback(
    async (
      content: string,
      industry?: string,
      context?: string
    ): Promise<AIStructureResult | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/ai/structure", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, industry, context }),
        });
        const json = await res.json();
        if (!json.success) {
          setError(json.error || "Failed to structure content");
          return null;
        }
        return json.data as AIStructureResult;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to structure content"
        );
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const generatePlaybook = useCallback(
    async (
      prompt: string,
      options?: { industry?: string; category?: string; context?: string }
    ): Promise<AIGenerateResult | null> => {
      setIsLoading(true);
      setError(null);
      setStreamingContent("");

      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, ...options }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const json = await res.json();
          setError(json.error || "Failed to generate playbook");
          return null;
        }

        // Handle streaming response
        const reader = res.body?.getReader();
        if (!reader) {
          setError("No response stream");
          return null;
        }

        const decoder = new TextDecoder();
        let fullContent = "";
        let metadata: Omit<AIGenerateResult, "content"> | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split("\n").filter(Boolean);

          for (const line of lines) {
            try {
              const chunk = JSON.parse(line);
              if (chunk.type === "content_delta") {
                fullContent += chunk.text;
                setStreamingContent(fullContent);
              } else if (chunk.type === "done") {
                metadata = chunk.metadata;
              }
            } catch {
              // Skip malformed lines
            }
          }
        }

        const result: AIGenerateResult = {
          content: fullContent,
          title: metadata?.title || "Generated Playbook",
          description: metadata?.description || "",
          detectedVariables: metadata?.detectedVariables || [],
          sections: metadata?.sections || [],
        };

        return result;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return null;
        }
        setError(
          err instanceof Error ? err.message : "Failed to generate playbook"
        );
        return null;
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    []
  );

  const assistAction = useCallback(
    async (
      action: AIAction,
      content: string,
      selection?: string
    ): Promise<AIAssistResult | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/ai/assist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, content, selection }),
        });
        const json = await res.json();
        if (!json.success) {
          setError(json.error || `Failed to ${action}`);
          return null;
        }
        return json.data as AIAssistResult;
      } catch (err) {
        setError(err instanceof Error ? err.message : `Failed to ${action}`);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isLoading,
    error,
    streamingContent,
    structureContent,
    generatePlaybook,
    assistAction,
    reset,
  };
}
