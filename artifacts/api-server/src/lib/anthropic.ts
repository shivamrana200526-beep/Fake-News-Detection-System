import Anthropic from "@anthropic-ai/sdk";

const apiKey =
  process.env.ANTHROPIC_API_KEY ||
  process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY ||
  "";

const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;

if (!apiKey) {
  console.warn("[SatyaCheck] No Anthropic API key found. Set ANTHROPIC_API_KEY.");
}

export const anthropic = new Anthropic({
  apiKey,
  ...(baseURL ? { baseURL } : {}),
});
