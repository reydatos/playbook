export type Role = "admin" | "editor" | "viewer";

export type PlaybookStatus = "draft" | "published" | "archived";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
}

export interface PlaybookVersion {
  id: string;
  playbookId: string;
  content: string;
  title: string;
  createdAt: string;
  createdBy: string;
  versionNumber: number;
  changeDescription: string;
}

export interface Playbook {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  status: PlaybookStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  versions: PlaybookVersion[];
  variables?: TemplateVariable[];
  sourceId?: string;
}

export interface PlaybookFormData {
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  status: PlaybookStatus;
}

// --- Template Variables ---

export interface TemplateVariable {
  key: string;
  label: string;
  description?: string;
  defaultValue?: string;
  type: "text" | "ip" | "url" | "hostname" | "number" | "select";
  options?: string[]; // for select type
  required?: boolean;
}

export interface VariableValues {
  [key: string]: string;
}

// --- Data Sources ---

export type SourceType = "manual_upload" | "url" | "api" | "vendor";

export type SourceStatus = "active" | "inactive" | "error";

export interface DataSource {
  id: string;
  name: string;
  type: SourceType;
  status: SourceStatus;
  config: SourceConfig;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  documentCount: number;
}

export interface SourceConfig {
  // URL source
  url?: string;
  // API source
  apiEndpoint?: string;
  apiKey?: string;
  headers?: Record<string, string>;
  // Vendor source
  vendor?: string;
  productFamily?: string;
  // Common
  refreshInterval?: number; // minutes, 0 = manual only
  contentSelector?: string; // CSS selector for URL scraping
}

// --- Import / Ingestion ---

export interface ImportRequest {
  title?: string;
  content?: string;
  url?: string;
  format?: "markdown" | "html" | "text" | "raw";
  sourceId?: string;
  extractVariables?: boolean;
  autoStructure?: boolean;
  aiEnhance?: boolean;
}

export interface ImportResult {
  title: string;
  content: string;
  detectedVariables: TemplateVariable[];
  sections: ContentSection[];
  metadata: ImportMetadata;
}

export interface ContentSection {
  id: string;
  title: string;
  level: number;
  content: string;
  startLine: number;
  endLine: number;
}

export interface ImportMetadata {
  sourceUrl?: string;
  originalFormat: string;
  wordCount: number;
  sectionCount: number;
  codeBlockCount: number;
  tableCount: number;
  importedAt: string;
}

// --- AI Authoring ---

export type AIAction =
  | "structure"
  | "generate"
  | "improve"
  | "troubleshoot"
  | "detect-issues"
  | "summarize";

export interface AIStructureRequest {
  content: string;
  context?: string;
  industry?: string;
}

export interface AIStructureResult {
  structured: string;
  detectedVariables: TemplateVariable[];
  sections: ContentSection[];
}

export interface AIGenerateRequest {
  prompt: string;
  context?: string;
  industry?: string;
  category?: string;
  includeVariables?: boolean;
}

export interface AIGenerateResult {
  content: string;
  title: string;
  description: string;
  detectedVariables: TemplateVariable[];
  sections: ContentSection[];
}

export interface AIAssistRequest {
  action: AIAction;
  content: string;
  selection?: string;
  context?: string;
}

export interface AIAssistResult {
  result: string;
  action: AIAction;
}

export interface VoiceTranscriptState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
}

// --- API Response Types ---

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}
