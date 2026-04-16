import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export function isAIAvailable(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

export const AI_MODEL = "claude-sonnet-4-20250514";
export const MAX_TOKENS = 4096;
