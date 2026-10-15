"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAgent, useCopilotKit } from "@copilotkit/react-core/v2";
import type {
  ChatInterrupt,
  ChatMessage,
  InterruptDecision,
  ResolvedInterrupt,
  Timings,
} from "./types";
import { toChatMessage, lastUserIndex } from "./utils";
import { CHAT_MODELS, DEFAULT_CHAT_MODEL } from "./models";
import { useChatTimings } from "./useChatTimings";
import { useChatInterrupts } from "./useChatInterrupts";
import { useChatPersistence } from "./useChatPersistence";
import { useChatList } from "./useChatList";
import type { ChatRecord } from "./db";
import { reportError, subscribeToChatErrors, type ChatError } from "./errors";

export interface UseChatApi {
  messages: ChatMessage[];
  isRunning: boolean;
  sendMessage: (text: string) => void;
  stopRun: () => void;
  clearMessages: () => void;
  error: ChatError | null;
  clearError: () => void;
  /** True once the user stops a run, until the next run or chat switch. */
  stopped: boolean;
  timings: Timings;
  /** Approvals the agent is waiting on. Every run is blocked until answered. */
  interrupts: ChatInterrupt[];
  /** Separate from isRunning - nothing streams, but sending is still refused. */
  awaitingApproval: boolean;
  /** Already decided, kept so the transcript still shows them. */
  resolvedInterrupts: ResolvedInterrupt[];
  /** A decision is on the wire. */
  interruptSubmitting: boolean;
  /** Record a decision. The resume fires once every open approval has one. */
  answerInterrupt: (id: string, decision: InterruptDecision) => void;
  /** model aliases the agent accepts - /ui reads them here, not from models.ts */
  models: readonly string[];
  /** Sent as forwardedProps.model on every run. */
  model: string;
  setModel: (model: string) => void;
  /** The prompt Retry and Edit act on, or null when neither is allowed. */
  editableMessageId: string | null;
  retry: () => void;
  editAndRerun: (text: string) => void;
  chatId: string;
  chats: ChatRecord[];
  chatsLoading: boolean;
  selectChat: (id: string) => Promise<void>;
  renameChat: (id: string, title: string) => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
  deleteAllChats: () => Promise<void>;
}

// headless facade for the chat UI - /ui imports this and ChatMessage, nothing else
export function useChat({ agentId = "default" }: { agentId?: string }): UseChatApi {
  const { agent } = useAgent({ agentId });
  const { copilotkit } = useCopilotKit();

  const [error, setError] = useState<ChatError | null>(null);
  const [stopped, setStopped] = useState(false);
  // re-runs the messages memo after our own addMessage, which only pushes
  const [bufferRevision, setBufferRevision] = useState(0);
  // not persisted on purpose - not worth it while CHAT_MODELS is hardcoded
  const [model, setModel] = useState(DEFAULT_CHAT_MODEL);

  // registered before the hooks below so it cannot miss what they report on mount
  useEffect(() => subscribeToChatErrors(setError), []);

  const clearError = useCallback(() => setError(null), []);

  const { timings, startTurn, reset: resetTimings } = useChatTimings(agent);
  // must stay above useChatPersistence - it takes getResolvedInterrupts as an argument
  const {
    interrupts,
    resolved: resolvedInterrupts,
    submitting: interruptSubmitting,
    answer: answerInterrupt,
    getResolved: getResolvedInterrupts,
    adopt: adoptInterrupts,
    clear: clearInterrupts,
  } = useChatInterrupts(agent, copilotkit, model);
  const { chats, loading: chatsLoading, refresh, rename, remove, clear } = useChatList();
  const { chatId, onUserMessage, newChat, openChat } = useChatPersistence(
    agent,
    refresh,
    getResolvedInterrupts,
  );

  const awaitingApproval = interrupts.length > 0;

  // skip while an approval is open - connectAgent detaches the run and kills the resume.
  // read agent.pendingInterrupts, not awaitingApproval, or this re-fires as the card clears
  useEffect(() => {
    if (agent.pendingInterrupts.length > 0) return;
    void copilotkit.connectAgent({ agent }).catch((err) => {
      reportError("connect", err);
    });
  }, [agent, copilotkit]);

  useEffect(() => {
    const sub = agent.subscribe({
      onNewMessage() {
        setBufferRevision((r) => r + 1);
      },
      onRunFailed({ error }) {
        reportError("run", error);
      },
      onRunErrorEvent({ event }) {
        if (event.code === "abort") return; // the user pressed Stop
        reportError("run", event);
      },
      // a real finish clears "stopped"; an interrupt is a pause, not an answer
      onRunFinishedEvent(params) {
        if (params.outcome === "interrupt") return;
        setStopped(false);
      },
    });
    return () => sub.unsubscribe();
  }, [agent]);

  // v2's <CopilotKit> drops onError, so subscribe here for transport and tool failures
  useEffect(() => {
    const sub = copilotkit.subscribe({
      onError({ error }) {
        reportError("run", error);
      },
    });
    return () => sub.unsubscribe();
  }, [copilotkit]);

  // translate the agent buffer into our own shape so /ui never sees an AG-UI type
  const messages = useMemo<ChatMessage[]>(
    () => agent.messages.flatMap(toChatMessage),
    // both deps needed or a freshly sent prompt hides behind "Running..."
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    [agent.messages, bufferRevision],
  );

  // forwardedProps is the only slot that survives the runtime's schema re-validation
  const runCurrent = useCallback(() => {
    if (agent.pendingInterrupts.length > 0) return;
    void copilotkit
      .runAgent({ agent, forwardedProps: { model } })
      .catch((err) => reportError("run", err));
  }, [agent, copilotkit, model]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || agent.isRunning || agent.pendingInterrupts.length > 0 || awaitingApproval)
        return;

      const id = crypto.randomUUID();

      setError(null);
      setStopped(false);

      // order matters: clock before the message, persist before the run
      startTurn(id);
      agent.addMessage({ id, role: "user", content: trimmed });
      onUserMessage();
      runCurrent();
    },
    [agent, onUserMessage, runCurrent, startTurn, awaitingApproval],
  );

  // no reportError: stopping is the user's doing, not a failure. warn instead
  const stopRun = useCallback(() => {
    if (!agent.isRunning) return;
    setStopped(true);
    try {
      void Promise.resolve(copilotkit.stopAgent({ agent })).catch((err) =>
        console.warn("[chat-core] stopAgent rejected", err),
      );
    } catch (err) {
      console.warn("[chat-core] stopAgent threw", err);
    }
  }, [agent, copilotkit]);

  const last = agent.messages[agent.messages.length - 1];
  // an open approval leaves isRunning false, so Retry/Edit would light up and then fail
  const editableMessageId =
    !agent.isRunning && !awaitingApproval && last?.role === "user" ? last.id : null;

  const retry = useCallback(() => {
    if (agent.isRunning || awaitingApproval) return;
    const idx = lastUserIndex(agent.messages);
    if (idx < 0) return;
    setError(null);
    setStopped(false);
    startTurn(agent.messages[idx].id);
    runCurrent();
  }, [agent, runCurrent, startTurn, awaitingApproval]);

  const editAndRerun = useCallback(
    (text: string) => {
      // check before setMessages - it truncates, so a blocked edit would lose the transcript
      if (agent.isRunning || agent.pendingInterrupts.length > 0 || awaitingApproval || !text.trim())
        return;
      const idx = lastUserIndex(agent.messages);
      if (idx < 0) return;
      agent.setMessages(agent.messages.slice(0, idx));
      sendMessage(text);
    },
    [agent, sendMessage, awaitingApproval],
  );

  // shared by New Chat and by loading an old one
  const resetLocalState = useCallback(() => {
    setError(null);
    setStopped(false);
    resetTimings();
    // pending interrupts outlive setMessages and a threadId swap - New Chat's escape
    clearInterrupts();
  }, [resetTimings, clearInterrupts]);

  const clearMessages = useCallback(() => {
    newChat();
    resetLocalState();
  }, [newChat, resetLocalState]);

  const selectChat = useCallback(
    async (id: string) => {
      const restored = await openChat(id);
      if (!restored) return;
      // resetLocalState wipes interrupt history, so seed the stored one after it
      resetLocalState();
      adoptInterrupts(restored);
    },
    [openChat, resetLocalState, adoptInterrupts],
  );

  const deleteChat = useCallback(
    async (id: string) => {
      if (id === chatId && agent.isRunning) return;
      await remove(id);
      if (id === chatId) clearMessages();
    },
    [agent, remove, chatId, clearMessages],
  );

  const deleteAllChats = useCallback(async () => {
    if (agent.isRunning) return;
    await clear();
    clearMessages();
  }, [agent, clear, clearMessages]);

  return {
    messages,
    isRunning: agent.isRunning,
    sendMessage,
    stopRun,
    clearMessages,
    error,
    clearError,
    stopped,
    timings,
    interrupts,
    awaitingApproval,
    resolvedInterrupts,
    interruptSubmitting,
    answerInterrupt,
    models: CHAT_MODELS,
    model,
    setModel,
    editableMessageId,
    retry,
    editAndRerun,
    chatId,
    chats,
    chatsLoading,
    selectChat,
    renameChat: rename,
    deleteChat,
    deleteAllChats,
  };
}
