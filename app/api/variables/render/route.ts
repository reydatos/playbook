import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/types";
import { renderTemplate } from "@/lib/parsers/content-parser";

/**
 * POST /api/variables/render
 *
 * Render a playbook template with variable values.
 * Replaces all {{variable}} placeholders with provided values.
 *
 * Body: {
 *   content: string (required)            - Template content with {{placeholders}}
 *   values: Record<string, string> (required) - Variable values to substitute
 * }
 *
 * Returns: { rendered: string } - The final content with variables replaced.
 */
export async function POST(request: NextRequest) {
  let body: { content?: string; values?: Record<string, string> };
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

  if (!body.values || typeof body.values !== "object") {
    return NextResponse.json(
      { success: false, error: "Values object is required" } as ApiResponse<null>,
      { status: 400 }
    );
  }

  const rendered = renderTemplate(body.content, body.values);

  // Find any remaining unresolved variables
  const unresolvedRegex = /\{\{(\w+)\}\}/g;
  const unresolved: string[] = [];
  let match;
  while ((match = unresolvedRegex.exec(rendered)) !== null) {
    if (!unresolved.includes(match[1])) {
      unresolved.push(match[1]);
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      rendered,
      unresolved,
    },
  } as ApiResponse<{ rendered: string; unresolved: string[] }>);
}
