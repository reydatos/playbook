import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, Playbook, PlaybookFormData } from "@/lib/types";
import * as store from "@/lib/store";
import { getSeedPlaybooks } from "@/lib/seed-data";
import { STORAGE_KEYS } from "@/lib/constants";

/**
 * GET /api/playbooks
 *
 * List all playbooks with optional filtering.
 *
 * Query params:
 *   - status: "draft" | "published" | "archived"
 *   - category: string
 *   - search: string (searches title, description, tags)
 *   - sort: "updated" | "created" | "title" (default: "updated")
 *   - page: number (default: 1)
 *   - limit: number (default: 50, max: 100)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "updated";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));

  let playbooks = store.getPlaybooks();

  // If no playbooks exist and not seeded, seed them
  if (playbooks.length === 0 && !store.isSeeded()) {
    const seeds = getSeedPlaybooks();
    if (typeof globalThis.localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.PLAYBOOKS, JSON.stringify(seeds));
      store.markSeeded();
      playbooks = seeds;
    }
  }

  // Filter by status
  if (status) {
    playbooks = playbooks.filter((p) => p.status === status);
  }

  // Filter by category
  if (category) {
    playbooks = playbooks.filter((p) => p.category === category);
  }

  // Search
  if (search) {
    const query = search.toLowerCase();
    playbooks = playbooks.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query))
    );
  }

  // Sort
  playbooks.sort((a, b) => {
    switch (sort) {
      case "created":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });

  // Paginate
  const total = playbooks.length;
  const start = (page - 1) * limit;
  const paginated = playbooks.slice(start, start + limit);

  const response: ApiResponse<Playbook[]> = {
    success: true,
    data: paginated,
    meta: { total, page, limit },
  };

  return NextResponse.json(response);
}

/**
 * POST /api/playbooks
 *
 * Create a new playbook.
 *
 * Body: {
 *   title: string (required)
 *   description: string
 *   content: string
 *   category: string
 *   tags: string[]
 *   status: "draft" | "published" | "archived"
 *   variables: TemplateVariable[]
 *   sourceId: string
 * }
 *
 * Headers:
 *   X-User-Id: string (required)
 */
export async function POST(request: NextRequest) {
  const userId = request.headers.get("X-User-Id") || "api-user";

  let body: PlaybookFormData & { variables?: unknown; sourceId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" } as ApiResponse<null>,
      { status: 400 }
    );
  }

  if (!body.title?.trim()) {
    return NextResponse.json(
      { success: false, error: "Title is required" } as ApiResponse<null>,
      { status: 400 }
    );
  }

  const formData: PlaybookFormData = {
    title: body.title,
    description: body.description || "",
    content: body.content || "",
    category: body.category || "General",
    tags: body.tags || [],
    status: body.status || "draft",
  };

  const playbook = store.createPlaybook(formData, userId);

  const response: ApiResponse<Playbook> = {
    success: true,
    data: playbook,
  };

  return NextResponse.json(response, { status: 201 });
}
