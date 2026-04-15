import { Role, PlaybookStatus } from "./types";

export const ROLES: { value: Role; label: string; description: string }[] = [
  {
    value: "admin",
    label: "Admin",
    description: "Full access - manage users, create, edit, and delete playbooks",
  },
  {
    value: "editor",
    label: "Editor",
    description: "Create and edit playbooks, view history",
  },
  {
    value: "viewer",
    label: "Viewer",
    description: "Read-only access to published playbooks",
  },
];

export const PLAYBOOK_STATUSES: {
  value: PlaybookStatus;
  label: string;
  color: string;
}[] = [
  { value: "draft", label: "Draft", color: "bg-yellow-100 text-yellow-800" },
  {
    value: "published",
    label: "Published",
    color: "bg-green-100 text-green-800",
  },
  {
    value: "archived",
    label: "Archived",
    color: "bg-gray-100 text-gray-800",
  },
];

export const CATEGORIES = [
  "Incident Response",
  "API Integration",
  "Database Operations",
  "Infrastructure",
  "Security",
  "Onboarding",
  "Deployment",
  "Monitoring",
  "Troubleshooting",
  "General",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const STORAGE_KEYS = {
  PLAYBOOKS: "playbook-editor-playbooks",
  AUTH: "playbook-editor-auth",
  SEEDED: "playbook-editor-seeded",
} as const;

export const APP_NAME = "PlayBook Editor";
