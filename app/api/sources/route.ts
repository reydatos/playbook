import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, DataSource, SourceConfig, SourceType } from "@/lib/types";
import * as sourceStore from "@/lib/source-store";

/**
 * GET /api/sources
 *
 * List all configured data sources.
 *
 * Query params:
 *   - type: "manual_upload" | "url" | "api" | "vendor"
 *   - status: "active" | "inactive" | "error"
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status");

  let sources = sourceStore.getSources();

  if (type) {
    sources = sources.filter((s) => s.type === type);
  }

  if (status) {
    sources = sources.filter((s) => s.status === status);
  }

  return NextResponse.json({
    success: true,
    data: sources,
    meta: { total: sources.length },
  } as ApiResponse<DataSource[]>);
}

/**
 * POST /api/sources
 *
 * Register a new data source.
 *
 * Body: {
 *   name: string (required)
 *   type: "manual_upload" | "url" | "api" | "vendor" (required)
 *   config: {
 *     url?: string                   - For URL sources
 *     apiEndpoint?: string           - For API sources
 *     apiKey?: string                - For API sources
 *     headers?: Record<string,string>- Custom headers for API sources
 *     vendor?: string                - For vendor sources (e.g., "cisco", "crestron")
 *     productFamily?: string         - For vendor sources (e.g., "webex-devices")
 *     refreshInterval?: number       - Auto-refresh interval in minutes (0 = manual)
 *     contentSelector?: string       - CSS selector for URL scraping
 *   }
 * }
 *
 * Headers:
 *   X-User-Id: string (required)
 */
export async function POST(request: NextRequest) {
  const userId = request.headers.get("X-User-Id") || "api-user";

  let body: { name?: string; type?: SourceType; config?: SourceConfig };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" } as ApiResponse<null>,
      { status: 400 }
    );
  }

  if (!body.name?.trim()) {
    return NextResponse.json(
      { success: false, error: "Name is required" } as ApiResponse<null>,
      { status: 400 }
    );
  }

  if (!body.type) {
    return NextResponse.json(
      { success: false, error: "Type is required" } as ApiResponse<null>,
      { status: 400 }
    );
  }

  const validTypes: SourceType[] = ["manual_upload", "url", "api", "vendor"];
  if (!validTypes.includes(body.type)) {
    return NextResponse.json(
      {
        success: false,
        error: `Invalid type. Must be one of: ${validTypes.join(", ")}`,
      } as ApiResponse<null>,
      { status: 400 }
    );
  }

  const source = sourceStore.createSource(
    body.name,
    body.type,
    body.config || {},
    userId
  );

  return NextResponse.json(
    { success: true, data: source } as ApiResponse<DataSource>,
    { status: 201 }
  );
}
