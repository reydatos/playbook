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
}

export interface PlaybookFormData {
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  status: PlaybookStatus;
}
