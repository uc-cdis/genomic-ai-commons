"use client";

import { useChat } from "../core";
import { ChatShell } from "./ChatShell";
import { ChatSidebar } from "./ChatSidebar";
import { ChatInput } from "./ChatInput";
import { ScrollArea, Stack } from "@mantine/core";
import { EmptyState } from "./EmptyState";
import { ErrorBanner } from "./ErrorBanner";
import { MessageList } from "./messages";
import { CHAT_MAX_WIDTH } from "./util";

export interface ChatProps {
  agentId?: string;
}

export function Chat({ agentId }: ChatProps) {
  const {
    messages,
    isRunning,
    sendMessage,
    stopRun,
    clearMessages,
    timings,
    chatId,
    chats,
    chatsLoading,
    selectChat,
    renameChat,
    deleteChat,
    error,
    clearError,
    stopped,
    retry,
    editableMessageId,
    editAndRerun,
    models,
    model,
    setModel,
  } = useChat({ agentId });

  const isEmpty = messages.length === 0 && !isRunning;

  return (
    <ChatShell
      sidebar={
        <ChatSidebar
          chats={chats}
          activeChatId={chatId}
          loading={chatsLoading}
          isRunning={isRunning}
          onNewConversation={clearMessages}
          onSelect={(id) => selectChat(id)}
          onRename={(id, title) => renameChat(id, title)}
          onDelete={(id) => deleteChat(id)}
        />
      }
    >
      <Stack flex={1} mih={0} miw={0} gap={0}>
        {isEmpty ? (
          <ScrollArea flex={1} mih={0}>
            <Stack gap="md" maw={CHAT_MAX_WIDTH} mx="auto" w="100%" px="lg" pt="xl">
              {error && <ErrorBanner error={error} onDismiss={clearError} />}
              <ChatInput
                isRunning={isRunning}
                onSend={sendMessage}
                onStop={stopRun}
                label="What would you like to know?"
                placeholder="Ask me a question about GDC data — example questions are available below."
                models={models}
                model={model}
                onModelChange={setModel}
              />
              <EmptyState onSelect={sendMessage} disabled={isRunning} />
            </Stack>
          </ScrollArea>
        ) : (
          <>
            <MessageList
              messages={messages}
              isRunning={isRunning}
              timings={timings}
              stopped={stopped}
              chatId={chatId}
              editableMessageId={editableMessageId}
              onRetry={retry}
              onEdit={editAndRerun}
            />

            <Stack
              gap="xs"
              maw={CHAT_MAX_WIDTH}
              mx="auto"
              w="100%"
              px="lg"
              pt="xs"
              pb="md"
              style={{ flexShrink: 0 }}
            >
              {error && <ErrorBanner error={error} onDismiss={clearError} />}

              <ChatInput
                isRunning={isRunning}
                onSend={sendMessage}
                onStop={stopRun}
                placeholder="Ask me a question about GDC data ..."
                models={models}
                model={model}
                onModelChange={setModel}
              />
            </Stack>
          </>
        )}
      </Stack>
    </ChatShell>
  );
}
