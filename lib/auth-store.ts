import { User } from "./types";
import { STORAGE_KEYS } from "./constants";

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.AUTH);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(user));
}

export function clearCurrentUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.AUTH);
}
