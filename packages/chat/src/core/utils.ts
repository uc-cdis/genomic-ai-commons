import type { Message } from "@copilotkit/react-core/v2";
import type { ChatMessage, ToolCall } from "./types";

// Message -> ChatMessage. Lossy for now; more of the agent's message fields will
// need to come across as the UI grows.
export function toChatMessage(message: Message): ChatMessage[] {
  if (message.role === "user") {
    const text = extractText(message.content);
    if (!text) return [];
    return [{ id: message.id, role: "user", content: text }];
  }

  if (message.role === "assistant") {
    const text = extractText(message.content);
    const toolCalls: ToolCall[] = (message.toolCalls ?? []).map((tc) => ({
      id: tc.id,
      name: tc.function.name,
      args: parseArgs(tc.function.arguments),
    }));

    if (!text && toolCalls.length === 0) return [];

    return [{ id: message.id, role: "assistant", content: text, toolCalls }];
  }

  if (message.role === "reasoning") {
    const text = typeof message.content === "string" ? message.content : "";
    if (!text) return [];

    return [{ id: message.id, role: "reasoning", content: text }];
  }

  if (message.role === "tool") {
    return [
      {
        id: message.id,
        role: "tool",
        toolCallId: message.toolCallId,
        // tool content can be parts too; only the text is rendered
        content: extractText(message.content),
      },
    ];
  }

  return [];
}

/** Arguments arrive as a growing string, so they only parse once complete. */
function parseArgs(raw: string): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/** AG-UI content can be a plain string or an array of multimodal parts. */
export function extractText(content: unknown): string {
  if (typeof content === "string") return content;

  if (Array.isArray(content)) {
    return content
      .filter(
        (part): part is { type: "text"; text: string } =>
          typeof part === "object" &&
          part !== null &&
          (part as { type?: unknown }).type === "text" &&
          typeof (part as { text?: unknown }).text === "string",
      )
      .map((part) => part.text)
      .join("");
  }

  return "";
}

/** Index of the most recent user message, or -1 if there is none. */
export function lastUserIndex(messages: Message[]): number {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return i;
  }
  return -1;
}

const TITLE_MAX = 80;

export function shortenTitle(text: string): string {
  const title = text.trim();
  if (title.length <= TITLE_MAX) return title;
  // a space at index 79 still leaves room for the "…"
  const lastSpace = title.lastIndexOf(" ", TITLE_MAX - 1);
  const kept = lastSpace > 0 ? title.slice(0, lastSpace) : title.slice(0, TITLE_MAX - 1);
  return `${kept.trimEnd()}…`;
}
