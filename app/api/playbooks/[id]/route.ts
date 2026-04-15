import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, Playbook, PlaybookFormData } from "@/lib/types";
import * as store from "@/lib/store";

/**
 * GET /api/playbooks/:id
 *
 * Get a single playbook by ID, including its version history.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const playbook = store.getPlaybook(params.id);

  if (!playbook) {
    return NextResponse.json(
      { success: false, error: "Playbook not found" } as ApiResponse<null>,
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: playbook,
  } as ApiResponse<Playbook>);
}

/**
 * PATCH /api/playbooks/:id
 *
 * Update a playbook. Only send fields you want to change.
 *
 * Body: Partial<PlaybookFormData> & { changeDescription?: string }
 *
 * Headers:
 *   X-User-Id: string (required)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = request.headers.get("X-User-Id") || "api-user";

  let body: Partial<PlaybookFormData> & { changeDescription?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" } as ApiResponse<null>,
      { status: 400 }
    );
  }

  const { changeDescription, ...updates } = body;
  const playbook = store.updatePlaybook(
    params.id,
    updates,
    userId,
    changeDescription
  );

  if (!playbook) {
    return NextResponse.json(
      { success: false, error: "Playbook not found" } as ApiResponse<null>,
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: playbook,
  } as ApiResponse<Playbook>);
}

/**
 * DELETE /api/playbooks/:id
 *
 * Delete a playbook and all its version history.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const success = store.deletePlaybook(params.id);

  if (!success) {
    return NextResponse.json(
      { success: false, error: "Playbook not found" } as ApiResponse<null>,
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: null,
  } as ApiResponse<null>);
}
