import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, DataSource } from "@/lib/types";
import * as sourceStore from "@/lib/source-store";

/**
 * GET /api/sources/:id
 *
 * Get a single data source by ID.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const source = sourceStore.getSource(params.id);

  if (!source) {
    return NextResponse.json(
      { success: false, error: "Source not found" } as ApiResponse<null>,
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: source,
  } as ApiResponse<DataSource>);
}

/**
 * PATCH /api/sources/:id
 *
 * Update a data source.
 *
 * Body: { name?: string, config?: SourceConfig, status?: SourceStatus }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let body: Partial<Pick<DataSource, "name" | "config" | "status">>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" } as ApiResponse<null>,
      { status: 400 }
    );
  }

  const source = sourceStore.updateSource(params.id, body);

  if (!source) {
    return NextResponse.json(
      { success: false, error: "Source not found" } as ApiResponse<null>,
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: source,
  } as ApiResponse<DataSource>);
}

/**
 * DELETE /api/sources/:id
 *
 * Remove a data source.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const success = sourceStore.deleteSource(params.id);

  if (!success) {
    return NextResponse.json(
      { success: false, error: "Source not found" } as ApiResponse<null>,
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: null,
  } as ApiResponse<null>);
}
