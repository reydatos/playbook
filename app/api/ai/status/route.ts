import { NextResponse } from "next/server";
import { isAIAvailable } from "@/lib/ai/client";

/**
 * GET /api/ai/status
 *
 * Check if AI features are available (API key configured).
 */
export async function GET() {
  return NextResponse.json({
    available: isAIAvailable(),
  });
}
