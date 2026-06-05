import { createServerFn } from "@tanstack/react-start";
import {
  SYSTEM_PROMPT,
  TOOL_SCHEMA,
  type ChatMessage,
  type ShopSnapshot,
} from "./copilot-tools";

// ============================================================================
// Key resolution - Workers (process.env), Vite dev (import.meta.env), and a
// globalThis fallback so we work in both runtimes. NEVER reads from the
// client-exposed VITE_* namespace.
// ============================================================================

function getKey(): string | undefined {
  // 1. Node / Workers (with nodejs_compat) / wrangler dev (from .dev.vars)
  if (typeof process !== "undefined" && process.env?.OPENAI_API_KEY) {
    return process.env.OPENAI_API_KEY;
  }
  // 2. Vite dev - loaded from .env.local on the server side
  try {
    const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> })
      .env;
    if (metaEnv?.OPENAI_API_KEY) return metaEnv.OPENAI_API_KEY;
  } catch {
    /* import.meta.env may not be available - ignore */
  }
  // 3. Final fallback: anything dropped on globalThis (Workers env binding bridge)
  const g = globalThis as unknown as { OPENAI_API_KEY?: string };
  if (g.OPENAI_API_KEY) return g.OPENAI_API_KEY;
  return undefined;
}

// ============================================================================
// OpenAI proxy - takes the running conversation + shop snapshot, returns the
// raw OpenAI chat completion response. The client loops on this until the
// model stops calling tools.
// ============================================================================

export const copilotChatServerFn = createServerFn({ method: "POST" })
  .inputValidator((d: { messages: ChatMessage[]; snapshot: ShopSnapshot }) => d)
  .handler(async ({ data }) => {
    const apiKey = getKey();
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY not configured. Add it to .env.local (Vite dev) and .dev.vars (wrangler dev).",
      );
    }

    const systemMessage = {
      role: "system" as const,
      content:
        SYSTEM_PROMPT +
        "\n\nCURRENT SHOP STATE:\n" +
        JSON.stringify(data.snapshot, null, 2),
    };

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [systemMessage, ...data.messages],
        tools: TOOL_SCHEMA,
        tool_choice: "auto",
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenAI ${res.status}: ${text}`);
    }

    return (await res.json()) as {
      choices: Array<{
        message: {
          role: "assistant";
          content: string | null;
          tool_calls?: Array<{
            id: string;
            type: "function";
            function: { name: string; arguments: string };
          }>;
        };
        finish_reason: string;
      }>;
    };
  });
