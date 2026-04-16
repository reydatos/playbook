import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, TemplateVariable } from "@/lib/types";
import {
  detectVariables,
} from "@/lib/parsers/content-parser";

/**
 * POST /api/variables/extract
 *
 * Detect template variables in content (IPs, hostnames, ports, existing placeholders).
 *
 * Body: {
 *   content: string (required) - The markdown content to scan
 * }
 *
 * Returns: Array of detected TemplateVariable objects.
 */
export async function POST(request: NextRequest) {
  let body: { content?: string };
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

  const variables = detectVariables(body.content);

  return NextResponse.json({
    success: true,
    data: variables,
    meta: { total: variables.length },
  } as ApiResponse<TemplateVariable[]>);
}
