import { Playbook, PlaybookVersion, PlaybookFormData } from "./types";
import { STORAGE_KEYS } from "./constants";
import { generateId } from "./utils";

function getAll(): Playbook[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PLAYBOOKS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveAll(playbooks: Playbook[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.PLAYBOOKS, JSON.stringify(playbooks));
}

export function getPlaybooks(): Playbook[] {
  return getAll();
}

export function getPlaybook(id: string): Playbook | null {
  const playbooks = getAll();
  return playbooks.find((p) => p.id === id) || null;
}

export function createPlaybook(
  data: PlaybookFormData,
  userId: string
): Playbook {
  const now = new Date().toISOString();
  const playbook: Playbook = {
    id: generateId(),
    ...data,
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
    updatedBy: userId,
    versions: [],
  };

  const playbooks = getAll();
  playbooks.unshift(playbook);
  saveAll(playbooks);
  return playbook;
}

export function updatePlaybook(
  id: string,
  updates: Partial<PlaybookFormData>,
  userId: string,
  changeDescription?: string
): Playbook | null {
  const playbooks = getAll();
  const index = playbooks.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const existing = playbooks[index];

  // Create version snapshot of previous state if content changed
  const contentChanged =
    updates.content !== undefined && updates.content !== existing.content;
  const titleChanged =
    updates.title !== undefined && updates.title !== existing.title;

  if (contentChanged || titleChanged) {
    const version: PlaybookVersion = {
      id: generateId(),
      playbookId: id,
      content: existing.content,
      title: existing.title,
      createdAt: existing.updatedAt,
      createdBy: existing.updatedBy,
      versionNumber: existing.versions.length + 1,
      changeDescription: changeDescription || "Auto-saved",
    };
    existing.versions.push(version);
  }

  const updated: Playbook = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
    updatedBy: userId,
  };

  playbooks[index] = updated;
  saveAll(playbooks);
  return updated;
}

export function deletePlaybook(id: string): boolean {
  const playbooks = getAll();
  const filtered = playbooks.filter((p) => p.id !== id);
  if (filtered.length === playbooks.length) return false;
  saveAll(filtered);
  return true;
}

export function getVersions(playbookId: string): PlaybookVersion[] {
  const playbook = getPlaybook(playbookId);
  if (!playbook) return [];
  return [...playbook.versions].reverse();
}

export function restoreVersion(
  playbookId: string,
  versionId: string,
  userId: string
): Playbook | null {
  const playbook = getPlaybook(playbookId);
  if (!playbook) return null;

  const version = playbook.versions.find((v) => v.id === versionId);
  if (!version) return null;

  return updatePlaybook(
    playbookId,
    {
      content: version.content,
      title: version.title,
    },
    userId,
    `Restored to version ${version.versionNumber}`
  );
}

export function isSeeded(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEYS.SEEDED) === "true";
}

export function markSeeded(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.SEEDED, "true");
}
