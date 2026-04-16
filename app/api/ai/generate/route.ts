import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, AIGenerateRequest } from "@/lib/types";
import { getClient, isAIAvailable, AI_MODEL, MAX_TOKENS } from "@/lib/ai/client";
import { getGeneratePrompt } from "@/lib/ai/prompts";
import { parseSections, detectVariables } from "@/lib/parsers/content-parser";

/**
 * POST /api/ai/generate
 *
 * Generate a complete playbook from a brief description.
 * Returns a streaming response (newline-delimited JSON).
 *
 * Body: { prompt: string, industry?: string, category?: string, context?: string }
 *
 * Stream format:
 *   {"type":"content_delta","text":"..."}
 *   {"type":"done","metadata":{title,description,detectedVariables,sections}}
 */
export async function POST(request: NextRequest) {
  let body: AIGenerateRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" } as ApiResponse<null>,
      { status: 400 }
    );
  }

  if (!body.prompt?.trim()) {
    return NextResponse.json(
      { success: false, error: "Prompt is required" } as ApiResponse<null>,
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
  const systemPrompt = getGeneratePrompt(body.industry, body.category);

  const userMessage = body.context
    ? `Existing context:\n${body.context}\n\n---\n\nGenerate a playbook for: ${body.prompt}`
    : `Generate a playbook for: ${body.prompt}`;

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  // Run streaming in the background
  (async () => {
    let fullContent = "";
    try {
      const messageStream = client.messages.stream({
        model: AI_MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      });

      for await (const event of messageStream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          const text = event.delta.text;
          fullContent += text;
          await writer.write(
            encoder.encode(
              JSON.stringify({ type: "content_delta", text }) + "\n"
            )
          );
        }
      }

      // Extract metadata from the generated content
      const sections = parseSections(fullContent);
      const detectedVariables = detectVariables(fullContent);
      const titleMatch = fullContent.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1].trim() : "Generated Playbook";

      // Take first paragraph after first heading as description
      const descMatch = fullContent.match(
        /^#[^#].*\n+(?:##\s+(?:Overview|Introduction|Summary)\n+)?([\s\S]*?)(?:\n##|\n```|$)/
      );
      const description = descMatch
        ? descMatch[1].trim().split("\n")[0].slice(0, 200)
        : "";

      await writer.write(
        encoder.encode(
          JSON.stringify({
            type: "done",
            metadata: { title, description, detectedVariables, sections },
          }) + "\n"
        )
      );
    } catch (err) {
      await writer.write(
        encoder.encode(
          JSON.stringify({
            type: "error",
            error:
              err instanceof Error ? err.message : "Generation failed",
          }) + "\n"
        )
      );
    } finally {
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
