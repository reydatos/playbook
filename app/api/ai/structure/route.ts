import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, AIStructureRequest, AIStructureResult } from "@/lib/types";
import { getClient, isAIAvailable, AI_MODEL, MAX_TOKENS } from "@/lib/ai/client";
import { getStructurePrompt } from "@/lib/ai/prompts";
import {
  parseSections,
  detectVariables,
  structureContent,
} from "@/lib/parsers/content-parser";

/**
 * POST /api/ai/structure
 *
 * Take raw/messy text and convert it into structured markdown.
 * Falls back to rule-based structuring if AI is unavailable.
 *
 * Body: { content: string, context?: string, industry?: string }
 */
export async function POST(request: NextRequest) {
  let body: AIStructureRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" } as ApiResponse<null>,
      { status: 400 }
    );
  }

  if (!body.content?.trim()) {
    return NextResponse.json(
      { success: false, error: "Content is required" } as ApiResponse<null>,
      { status: 400 }
    );
  }

  let structured: string;

  if (isAIAvailable()) {
    const client = getClient()!;
    try {
      const message = await client.messages.create({
        model: AI_MODEL,
        max_tokens: MAX_TOKENS,
        system: getStructurePrompt(body.industry),
        messages: [
          {
            role: "user",
            content: body.context
              ? `Context from surrounding playbook:\n${body.context}\n\n---\n\nText to structure:\n${body.content}`
              : body.content,
          },
        ],
      });

      const textBlock = message.content.find((b) => b.type === "text");
      structured = textBlock ? textBlock.text : structureContent(body.content);
    } catch (err) {
      // Fall back to rule-based on AI error
      console.error("AI structure error, falling back:", err);
      structured = structureContent(body.content);
    }
  } else {
    // No API key — use rule-based structuring
    structured = structureContent(body.content);
  }

  const sections = parseSections(structured);
  const detectedVariables = detectVariables(structured);

  const result: AIStructureResult = {
    structured,
    detectedVariables,
    sections,
  };

  return NextResponse.json({
    success: true,
    data: result,
  } as ApiResponse<AIStructureResult>);
}
