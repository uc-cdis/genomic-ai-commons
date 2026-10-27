// Owns chat identity and write policy.
import { useCallback, useEffect, useState } from "react";
import type { AbstractAgent, Message } from "@copilotkit/react-core/v2";
import { saveChat, loadChat } from "./db";
import { reportError } from "./errors";

export interface UseChatPersistence {
  /** Id of the chat that's currently loaded or running */
  chatId: string;
  /** Write point 1. Call from sendMessage, right after agent.addMessage. */
  onUserMessage: () => void;
  /** New chat. Clears the agent buffer. No-op mid-run. */
  newChat: () => void;
  /** Load an existing chat into the agent. False when the id is unknown or mid-run. */
  openChat: (id: string) => Promise<boolean>;
}

/** Keep the prompt, drop whatever the run produced. */
function truncateToLastUser(messages: Message[]): Message[] {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return messages.slice(0, i + 1);
  }
  return [];
}

/** First user message, trimmed to 80 chars. Only used when the row is created. */
function deriveTitle(messages: Message[]): string {
  const first = messages.find((m) => m.role === "user");
  const content = first?.content;
  const text =
    typeof content === "string"
      ? content
      : Array.isArray(content)
        ? content
            .filter((p: any) => p?.type === "text")
            .map((p: any) => p.text)
            .join("")
        : "";

  return text.trim().slice(0, 80) || "New Chat";
}

function newId(): string {
  return crypto.randomUUID();
}

/**
 * Persists the agent's buffer to IndexedDB, one record per chat. Writes on send
 * and on a successful run; rolls back to the last user message when a run fails,
 * so a retry doesn't inherit half an answer.
 */
export function useChatPersistence(
  agent: AbstractAgent,
  refresh: () => Promise<void>,
): UseChatPersistence {
  const [chatId, setChatId] = useState(() => (agent.threadId ??= newId()));

  const setChat = useCallback(
    (id: string) => {
      // We own agent.threadId - CopilotKit's ThreadsProvider never writes it.
      // oxlint-disable-next-line react/immutability
      agent.threadId = id;
      setChatId(id);
    },
    [agent],
  );

  const write = useCallback(
    (messages: Message[]) => {
      void saveChat({
        id: chatId,
        title: deriveTitle(messages),
        messages,
      })
        .then(refresh)
        .catch((err) => reportError("persist", err));
    },
    [chatId, refresh],
  );

  // Write point 2 (RUN_FINISHED) and the error rollback.
  useEffect(() => {
    const sub = agent.subscribe({
      onRunFinishedEvent({ outcome }) {
        // Only a successful finish is saved: anything else may be half a turn, and the
        // agent rebuilds its history from what we send, so a saved one can break the next.
        if (outcome !== "success") return;
        write(agent.messages.slice());
      },
      onRunErrorEvent({ event }) {
        if (event.code === "abort") return; // the user pressed Stop
        agent.setMessages(truncateToLastUser(agent.messages));
      },
    });
    return () => sub.unsubscribe();
  }, [agent, write]);

  // Save the prompt before the run, so a crash or reload can't lose it.
  const onUserMessage = useCallback(() => {
    write(agent.messages.slice());
  }, [agent, write]);

  // No write here, so an empty chat never shows up in the sidebar.
  const newChat = useCallback(() => {
    if (agent.isRunning) return;
    setChat(newId());
    agent.setMessages([]);
  }, [agent, setChat]);

  /** Swap the buffer for a stored transcript. False if the id is unknown. */
  const openChat = useCallback(
    async (id: string) => {
      if (agent.isRunning) return false;

      const loaded = await loadChat(id);
      if (!loaded) return false;
      agent.setMessages(loaded.messages);
      setChat(loaded.chat.id);
      return true;
    },
    [agent, setChat],
  );

  return { chatId, onUserMessage, newChat, openChat };
}
