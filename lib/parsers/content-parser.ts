import {
  ContentSection,
  ImportMetadata,
  TemplateVariable,
} from "@/lib/types";
import { generateId } from "@/lib/utils";

/**
 * Parse raw content into structured sections by detecting markdown headings.
 */
export function parseSections(content: string): ContentSection[] {
  const lines = content.split("\n");
  const sections: ContentSection[] = [];
  let currentSection: ContentSection | null = null;
  let contentBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

    if (headingMatch) {
      // Save previous section
      if (currentSection) {
        currentSection.content = contentBuffer.join("\n").trim();
        currentSection.endLine = i - 1;
        sections.push(currentSection);
      }

      currentSection = {
        id: generateId(),
        title: headingMatch[2].trim(),
        level: headingMatch[1].length,
        content: "",
        startLine: i,
        endLine: i,
      };
      contentBuffer = [];
    } else {
      contentBuffer.push(line);
    }
  }

  // Save final section
  if (currentSection) {
    currentSection.content = contentBuffer.join("\n").trim();
    currentSection.endLine = lines.length - 1;
    sections.push(currentSection);
  }

  // If no headings found, treat entire content as one section
  if (sections.length === 0 && content.trim()) {
    sections.push({
      id: generateId(),
      title: "Content",
      level: 1,
      content: content.trim(),
      startLine: 0,
      endLine: lines.length - 1,
    });
  }

  return sections;
}

/**
 * Extract metadata from content.
 */
export function extractMetadata(
  content: string,
  sourceUrl?: string
): ImportMetadata {
  const codeBlockCount = (content.match(/```/g) || []).length / 2;
  const tableRows = (content.match(/\|.*\|/g) || []).length;
  const tableCount = Math.max(0, Math.floor(tableRows / 3)); // rough estimate
  const sections = parseSections(content);

  return {
    sourceUrl,
    originalFormat: "markdown",
    wordCount: content.split(/\s+/).filter(Boolean).length,
    sectionCount: sections.length,
    codeBlockCount: Math.floor(codeBlockCount),
    tableCount,
    importedAt: new Date().toISOString(),
  };
}

/**
 * Detect potential template variables in content.
 * Looks for IP addresses, URLs, hostnames, email-like patterns,
 * and existing {{variable}} placeholders.
 */
export function detectVariables(content: string): TemplateVariable[] {
  const variables: TemplateVariable[] = [];
  const seen = new Set<string>();

  // Detect existing {{variable}} placeholders
  const placeholderRegex = /\{\{(\w+)\}\}/g;
  let match;
  while ((match = placeholderRegex.exec(content)) !== null) {
    const key = match[1];
    if (!seen.has(key)) {
      seen.add(key);
      variables.push({
        key,
        label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        type: "text",
        required: true,
      });
    }
  }

  // Detect IP addresses (not in code block comments)
  const ipRegex = /\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/g;
  const ips = new Set<string>();
  while ((match = ipRegex.exec(content)) !== null) {
    const ip = match[1];
    // Skip common non-configurable IPs
    if (ip === "127.0.0.1" || ip === "0.0.0.0" || ip === "255.255.255.255")
      continue;
    ips.add(ip);
  }
  let ipIndex = 1;
  for (const ip of Array.from(ips)) {
    const key = `ip_address_${ipIndex}`;
    if (!seen.has(key)) {
      seen.add(key);
      variables.push({
        key,
        label: `IP Address ${ipIndex}`,
        description: `Detected IP: ${ip}`,
        defaultValue: ip,
        type: "ip",
        required: false,
      });
      ipIndex++;
    }
  }

  // Detect hostnames/domains (simple heuristic)
  const hostnameRegex =
    /\b([a-z][a-z0-9-]*\.[a-z]{2,}(?:\.[a-z]{2,})?)\b/gi;
  const hostnames = new Set<string>();
  while ((match = hostnameRegex.exec(content)) !== null) {
    const hostname = match[1].toLowerCase();
    // Skip common example/docs domains
    if (
      hostname.includes("example.com") ||
      hostname.includes("github.com") ||
      hostname.includes("nextjs.org")
    )
      continue;
    hostnames.add(hostname);
  }
  let hostIndex = 1;
  for (const hostname of Array.from(hostnames)) {
    const key = `hostname_${hostIndex}`;
    if (!seen.has(key)) {
      seen.add(key);
      variables.push({
        key,
        label: `Hostname ${hostIndex}`,
        description: `Detected hostname: ${hostname}`,
        defaultValue: hostname,
        type: "hostname",
        required: false,
      });
      hostIndex++;
    }
  }

  // Detect port numbers in context (e.g., ":8080", "port 443")
  const portRegex = /(?:port\s+|:)(\d{2,5})\b/gi;
  const ports = new Set<string>();
  while ((match = portRegex.exec(content)) !== null) {
    ports.add(match[1]);
  }
  let portIndex = 1;
  for (const port of Array.from(ports)) {
    const key = `port_${portIndex}`;
    if (!seen.has(key)) {
      seen.add(key);
      variables.push({
        key,
        label: `Port ${portIndex}`,
        description: `Detected port: ${port}`,
        defaultValue: port,
        type: "number",
        required: false,
      });
      portIndex++;
    }
  }

  return variables;
}

/**
 * Replace detected values with template variable placeholders.
 */
export function applyVariables(
  content: string,
  variables: TemplateVariable[]
): string {
  let result = content;

  for (const variable of variables) {
    if (variable.defaultValue) {
      // Escape special regex characters in the default value
      const escaped = variable.defaultValue.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );
      const regex = new RegExp(escaped, "g");
      result = result.replace(regex, `{{${variable.key}}}`);
    }
  }

  return result;
}

/**
 * Render template content with actual variable values.
 */
export function renderTemplate(
  content: string,
  values: Record<string, string>
): string {
  let result = content;

  for (const [key, value] of Object.entries(values)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    result = result.replace(regex, value);
  }

  return result;
}

/**
 * Convert plain text to structured markdown.
 * Detects numbered lists, bullet points, code-like content, etc.
 */
export function structureContent(rawText: string): string {
  const lines = rawText.split("\n");
  const output: string[] = [];
  const inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Detect code-like content (commands, config)
    if (
      !inCodeBlock &&
      (trimmed.startsWith("$ ") ||
        trimmed.startsWith("# ") && trimmed.includes("=") ||
        trimmed.match(/^(sudo|apt|yum|npm|pip|curl|wget|docker|kubectl)\s/))
    ) {
      output.push("```bash");
      output.push(trimmed.startsWith("$ ") ? trimmed.slice(2) : trimmed);
      // Check if next lines are also commands
      let j = i + 1;
      while (
        j < lines.length &&
        (lines[j].trim().startsWith("$ ") ||
          lines[j].trim().match(
            /^(sudo|apt|yum|npm|pip|curl|wget|docker|kubectl)\s/
          ))
      ) {
        const nextTrimmed = lines[j].trim();
        output.push(
          nextTrimmed.startsWith("$ ") ? nextTrimmed.slice(2) : nextTrimmed
        );
        j++;
      }
      output.push("```");
      i = j - 1;
      continue;
    }

    // Detect section headers (ALL CAPS lines, or lines followed by === or ---)
    if (
      trimmed.length > 3 &&
      trimmed === trimmed.toUpperCase() &&
      !trimmed.match(/^[^A-Z]*$/) &&
      trimmed.match(/^[A-Z\s\-:]+$/)
    ) {
      output.push(`## ${trimmed.charAt(0)}${trimmed.slice(1).toLowerCase()}`);
      continue;
    }

    // Pass through everything else
    output.push(line);
  }

  return output.join("\n");
}

/**
 * Convert HTML to markdown (basic conversion).
 */
export function htmlToMarkdown(html: string): string {
  let md = html;

  // Remove scripts and styles
  md = md.replace(/<script[\s\S]*?<\/script>/gi, "");
  md = md.replace(/<style[\s\S]*?<\/style>/gi, "");

  // Headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "# $1\n");
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "## $1\n");
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "### $1\n");
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "#### $1\n");
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, "##### $1\n");
  md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, "###### $1\n");

  // Bold and italic
  md = md.replace(/<(?:b|strong)[^>]*>([\s\S]*?)<\/(?:b|strong)>/gi, "**$1**");
  md = md.replace(/<(?:i|em)[^>]*>([\s\S]*?)<\/(?:i|em)>/gi, "_$1_");

  // Code
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`");
  md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, "```\n$1\n```\n");

  // Links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");

  // Images
  md = md.replace(
    /<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi,
    "![$2]($1)"
  );

  // Lists
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n");
  md = md.replace(/<\/?(?:ul|ol)[^>]*>/gi, "\n");

  // Paragraphs and breaks
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "$1\n\n");
  md = md.replace(/<br\s*\/?>/gi, "\n");

  // Table conversion (basic)
  md = md.replace(/<table[\s\S]*?<\/table>/gi, (table) => {
    const rows: string[] = [];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;
    let isHeader = true;

    while ((rowMatch = rowRegex.exec(table)) !== null) {
      const cells: string[] = [];
      const cellRegex = /<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi;
      let cellMatch;

      while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
        cells.push(cellMatch[1].trim());
      }

      if (cells.length > 0) {
        rows.push("| " + cells.join(" | ") + " |");
        if (isHeader) {
          rows.push(
            "| " + cells.map(() => "---").join(" | ") + " |"
          );
          isHeader = false;
        }
      }
    }

    return rows.join("\n") + "\n";
  });

  // Remove remaining HTML tags
  md = md.replace(/<[^>]+>/g, "");

  // Decode HTML entities
  md = md.replace(/&amp;/g, "&");
  md = md.replace(/&lt;/g, "<");
  md = md.replace(/&gt;/g, ">");
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");
  md = md.replace(/&nbsp;/g, " ");

  // Clean up excessive whitespace
  md = md.replace(/\n{3,}/g, "\n\n");

  return md.trim();
}
