import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, AIAssistRequest, AIAssistResult, AIAction } from "@/lib/types";
import { getClient, isAIAvailable, AI_MODEL, MAX_TOKENS } from "@/lib/ai/client";
import { getAssistPrompt } from "@/lib/ai/prompts";

const VALID_ACTIONS: AIAction[] = [
  "structure",
  "generate",
  "improve",
  "troubleshoot",
  "detect-issues",
  "summarize",
];

/**
 * POST /api/ai/assist
 *
 * Run an AI assist action on playbook content.
 *
 * Body: {
 *   action: "improve" | "troubleshoot" | "detect-issues" | "summarize"
 *   content: string (full playbook content)
 *   selection?: string (selected text, required for "improve")
 * }
 */
export async function POST(request: NextRequest) {
  let body: AIAssistRequest;
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

  if (!body.action || !VALID_ACTIONS.includes(body.action)) {
    return NextResponse.json(
      {
        success: false,
        error: `Invalid action. Must be one of: ${VALID_ACTIONS.join(", ")}`,
      } as ApiResponse<null>,
      { status: 400 }
    );
  }

  if (body.action === "improve" && !body.selection?.trim()) {
    return NextResponse.json(
      {
        success: false,
        error: "Selection is required for the improve action",
      } as ApiResponse<null>,
      { status: 400 }
    );
  }

  if (!isAIAvailable()) {
    return NextResponse.json(
      {
        success: false,
        error: "AI features are not available. Configure ANTHROPIC_API_KEY.",
      } as ApiResponse<null>,
      { status: 503 }
    );
  }

  const client = getClient()!;
  const systemPrompt = getAssistPrompt(body.action);

  let userMessage: string;
  switch (body.action) {
    case "improve":
      userMessage = `Full playbook context:\n${body.content}\n\n---\n\nText to improve:\n${body.selection}`;
      break;
    case "troubleshoot":
      userMessage = `Generate a troubleshooting section for this playbook:\n\n${body.content}`;
      break;
    case "detect-issues":
      userMessage = `Review this playbook for issues:\n\n${body.content}`;
      break;
    case "summarize":
      userMessage = `Summarize this playbook:\n\n${body.content}`;
      break;
    default:
      userMessage = body.content;
  }

  try {
    const message = await client.messages.create({
      model: AI_MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    const result: AIAssistResult = {
      result: textBlock ? textBlock.text : "",
      action: body.action,
    };

    return NextResponse.json({
      success: true,
      data: result,
    } as ApiResponse<AIAssistResult>);
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "AI assist failed",
      } as ApiResponse<null>,
      { status: 500 }
    );
  }
}
