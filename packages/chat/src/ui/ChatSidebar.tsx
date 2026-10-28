"use client";

import { useState } from "react";
import { Box, Button, ScrollArea, Skeleton, Stack, Text, TextInput } from "@mantine/core";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import type { ChatRecord } from "../core";
import { ConversationItem } from "./ConversationItem";
import { groupChatsByDay, HEADER_HEIGHT, searchChats } from "./util";

export interface ChatSidebarProps {
  chats: ChatRecord[];
  activeChatId: string;
  loading: boolean;
  isRunning: boolean;
  onNewConversation: () => void;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

export function ChatSidebar({
  chats,
  activeChatId,
  loading,
  isRunning,
  onNewConversation,
  onSelect,
  onRename,
  onDelete,
}: ChatSidebarProps) {
  const [query, setQuery] = useState("");
  const groups = groupChatsByDay(searchChats(chats, query));
  const isDraft = !loading && !chats.some((chat) => chat.id === activeChatId);

  return (
    <Stack gap="md" flex={1} mih={0}>
      <Box
        mx="calc(var(--mantine-spacing-md) * -1)"
        mt="calc(var(--mantine-spacing-md) * -1)"
        h={HEADER_HEIGHT}
        px="md"
        style={{
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          borderBottom: "1px solid var(--chat-rule)",
        }}
      >
        <Text fw={700} size="lg" lh={1.2} c="var(--chat-title)">
          Genomics Explorer
        </Text>
      </Box>

      <Button
        leftSection={<IconPlus size={16} />}
        variant="filled"
        color="var(--chat-primary)"
        fullWidth
        onClick={onNewConversation}
        disabled={isRunning || isDraft}
      >
        New Conversation
      </Button>

      <TextInput
        leftSection={<IconSearch size={16} />}
        placeholder="Search chats"
        aria-label="Search chats"
        value={query}
        onChange={(event) => setQuery(event.currentTarget.value)}
      />

      <ScrollArea flex={1} mih={0} type="auto" offsetScrollbars>
        {loading ? (
          <Stack gap="xs">
            <Skeleton height={36} radius="sm" />
            <Skeleton height={36} radius="sm" />
            <Skeleton height={36} radius="sm" />
          </Stack>
        ) : groups.length === 0 && chats.length > 0 ? (
          <Text size="sm" c="var(--chat-muted)">
            No chats match
          </Text>
        ) : (
          <Stack gap="md">
            {groups.map((group) => (
              <Stack gap="xs" key={group.label}>
                <Text size="xs" fw={700} c="var(--chat-muted)" lts="1px">
                  {group.label}
                </Text>
                {group.chats.map((chat) => (
                  <ConversationItem
                    key={chat.id}
                    label={chat.title}
                    active={chat.id === activeChatId}
                    deleteDisabled={isRunning && chat.id === activeChatId}
                    onClick={() => onSelect(chat.id)}
                    onRename={(title) => onRename(chat.id, title)}
                    onDelete={() => onDelete(chat.id)}
                  />
                ))}
              </Stack>
            ))}
          </Stack>
        )}
      </ScrollArea>
    </Stack>
  );
}
