import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, Playbook, PlaybookVersion } from "@/lib/types";
import * as store from "@/lib/store";

/**
 * GET /api/playbooks/:id/versions
 *
 * List all versions for a playbook (newest first).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const versions = store.getVersions(params.id);

  return NextResponse.json({
    success: true,
    data: versions,
    meta: { total: versions.length },
  } as ApiResponse<PlaybookVersion[]>);
}

/**
 * POST /api/playbooks/:id/versions/:versionId/restore
 *
 * Restore a playbook to a specific version.
 *
 * Headers:
 *   X-User-Id: string (required)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = request.headers.get("X-User-Id") || "api-user";
  const { searchParams } = new URL(request.url);
  const versionId = searchParams.get("restore");

  if (!versionId) {
    return NextResponse.json(
      {
        success: false,
        error: "Use ?restore=<versionId> to restore a version",
      } as ApiResponse<null>,
      { status: 400 }
    );
  }

  const playbook = store.restoreVersion(params.id, versionId, userId);

  if (!playbook) {
    return NextResponse.json(
      {
        success: false,
        error: "Playbook or version not found",
      } as ApiResponse<null>,
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: playbook,
  } as ApiResponse<Playbook>);
}
