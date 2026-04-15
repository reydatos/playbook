import { NextRequest, NextResponse } from "next/server";
import {
  ApiResponse,
  ImportRequest,
  ImportResult,
} from "@/lib/types";
import {
  parseSections,
  extractMetadata,
  detectVariables,
  structureContent,
  htmlToMarkdown,
} from "@/lib/parsers/content-parser";

/**
 * POST /api/import
 *
 * Import content from various sources and convert to structured playbook format.
 *
 * Body: {
 *   title?: string                  - Override title (auto-detected if omitted)
 *   content?: string                - Raw content to import
 *   url?: string                    - URL to fetch content from
 *   format?: "markdown" | "html" | "text" | "raw"  - Input format (default: auto-detect)
 *   sourceId?: string               - Link to a data source
 *   extractVariables?: boolean      - Detect template variables (default: true)
 *   autoStructure?: boolean         - Auto-convert plain text to markdown (default: true)
 * }
 *
 * Returns: ImportResult with structured content, detected variables, sections, and metadata.
 */
export async function POST(request: NextRequest) {
  let body: ImportRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" } as ApiResponse<null>,
      { status: 400 }
    );
  }

  let rawContent = body.content || "";
  let sourceUrl: string | undefined;

  // Fetch from URL if provided
  if (body.url) {
    try {
      const response = await fetch(body.url, {
        headers: { "User-Agent": "PlaybookEditor/1.0" },
      });
      if (!response.ok) {
        return NextResponse.json(
          {
            success: false,
            error: `Failed to fetch URL: ${response.status} ${response.statusText}`,
          } as ApiResponse<null>,
          { status: 422 }
        );
      }
      rawContent = await response.text();
      sourceUrl = body.url;

      // Auto-detect format from content type
      const contentType = response.headers.get("content-type") || "";
      if (!body.format) {
        if (contentType.includes("text/html")) {
          body.format = "html";
        } else if (contentType.includes("text/markdown")) {
          body.format = "markdown";
        } else {
          body.format = "text";
        }
      }
    } catch (err) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch URL: ${err instanceof Error ? err.message : "Unknown error"}`,
        } as ApiResponse<null>,
        { status: 422 }
      );
    }
  }

  if (!rawContent.trim()) {
    return NextResponse.json(
      {
        success: false,
        error: "No content provided. Supply 'content' or 'url'.",
      } as ApiResponse<null>,
      { status: 400 }
    );
  }

  // Convert to markdown based on format
  let markdownContent = rawContent;
  const format = body.format || "raw";

  if (format === "html") {
    markdownContent = htmlToMarkdown(rawContent);
  } else if (format === "text" || format === "raw") {
    if (body.autoStructure !== false) {
      markdownContent = structureContent(rawContent);
    }
  }
  // "markdown" format: use as-is

  // Detect title from first heading if not provided
  let title = body.title || "";
  if (!title) {
    const firstHeading = markdownContent.match(/^#\s+(.+)$/m);
    if (firstHeading) {
      title = firstHeading[1].trim();
    } else {
      title = "Imported Playbook";
    }
  }

  // Parse sections
  const sections = parseSections(markdownContent);

  // Detect variables
  const detectedVariables =
    body.extractVariables !== false ? detectVariables(markdownContent) : [];

  // Extract metadata
  const metadata = extractMetadata(markdownContent, sourceUrl);
  metadata.originalFormat = format;

  const result: ImportResult = {
    title,
    content: markdownContent,
    detectedVariables,
    sections,
    metadata,
  };

  return NextResponse.json({
    success: true,
    data: result,
  } as ApiResponse<ImportResult>);
}
