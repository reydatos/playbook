import { DataSource, SourceConfig, SourceType } from "./types";
import { generateId } from "./utils";

const STORAGE_KEY = "playbook-editor-sources";

function getAll(): DataSource[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveAll(sources: DataSource[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
}

export function getSources(): DataSource[] {
  return getAll();
}

export function getSource(id: string): DataSource | null {
  return getAll().find((s) => s.id === id) || null;
}

export function createSource(
  name: string,
  type: SourceType,
  config: SourceConfig,
  userId: string
): DataSource {
  const now = new Date().toISOString();
  const source: DataSource = {
    id: generateId(),
    name,
    type,
    status: "active",
    config,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
    documentCount: 0,
  };
  const sources = getAll();
  sources.unshift(source);
  saveAll(sources);
  return source;
}

export function updateSource(
  id: string,
  updates: Partial<Pick<DataSource, "name" | "config" | "status">>
): DataSource | null {
  const sources = getAll();
  const index = sources.findIndex((s) => s.id === id);
  if (index === -1) return null;
  sources[index] = {
    ...sources[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveAll(sources);
  return sources[index];
}

export function deleteSource(id: string): boolean {
  const sources = getAll();
  const filtered = sources.filter((s) => s.id !== id);
  if (filtered.length === sources.length) return false;
  saveAll(filtered);
  return true;
}

export function incrementDocumentCount(id: string): void {
  const sources = getAll();
  const index = sources.findIndex((s) => s.id === id);
  if (index === -1) return;
  sources[index].documentCount++;
  sources[index].lastSyncedAt = new Date().toISOString();
  saveAll(sources);
}
