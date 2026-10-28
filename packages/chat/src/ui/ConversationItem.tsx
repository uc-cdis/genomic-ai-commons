"use client";

import { useState } from "react";
import { ActionIcon, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { IconDots, IconMessage } from "@tabler/icons-react";
import { ChatActionsMenu } from "./ChatActionsMenu";
import { TitleInput } from "./TitleInput";

export interface ConversationItemProps {
  label: string;
  hint?: string;
  active?: boolean;
  showActions?: boolean;
  deleteDisabled?: boolean;
  onClick?: () => void;
  onRename?: (title: string) => void;
  onDelete?: () => void;
}

export function ConversationItem({
  label,
  hint,
  active,
  showActions = true,
  deleteDisabled,
  onClick,
  onRename,
  onDelete,
}: ConversationItemProps) {
  const [editing, setEditing] = useState(false);

  return (
    <Group
      gap={4}
      wrap="nowrap"
      px="xs"
      py={6}
      style={{
        borderRadius: "var(--mantine-radius-sm)",
        backgroundColor: active ? "var(--mantine-color-body)" : "transparent",
        border: active ? "1px solid var(--chat-rule)" : "1px solid transparent",
      }}
    >
      {editing ? (
        <TitleInput
          title={label}
          onRename={(title) => onRename?.(title)}
          onDone={() => setEditing(false)}
        />
      ) : (
        <>
          <UnstyledButton
            onClick={onClick}
            style={{ flex: 1, minWidth: 0, cursor: onClick ? "pointer" : "default" }}
          >
            <Group gap="xs" wrap="nowrap" align="flex-start">
              <IconMessage
                size={16}
                color="var(--chat-accent)"
                style={{ marginTop: 2, flexShrink: 0 }}
              />
              <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
                <Text size="sm" fw={active ? 600 : 500} truncate="end">
                  {label}
                </Text>
                {hint && (
                  <Text size="xs" c="var(--chat-muted)" truncate="end">
                    {hint}
                  </Text>
                )}
              </Stack>
            </Group>
          </UnstyledButton>

          {showActions && (
            <ChatActionsMenu
              deleteDisabled={deleteDisabled}
              onRename={() => setEditing(true)}
              onDelete={onDelete}
            >
              <ActionIcon
                variant="subtle"
                color="var(--chat-accent)"
                size="sm"
                data-keep-open
                aria-label={`Actions for ${label}`}
              >
                <IconDots size={16} />
              </ActionIcon>
            </ChatActionsMenu>
          )}
        </>
      )}
    </Group>
  );
}
