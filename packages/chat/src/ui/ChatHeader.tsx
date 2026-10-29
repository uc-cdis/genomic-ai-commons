"use client";

import { useState } from "react";
import { Group, Menu, /* Select, */ Text, UnstyledButton } from "@mantine/core";
import { IconChevronDown, IconPencil, IconTrash } from "@tabler/icons-react";
import { TitleInput } from "./TitleInput";

export interface ChatHeaderProps {
  /** none while the chat is new and unsaved */
  title?: string;
  deleteDisabled: boolean;
  onRename: (title: string) => void;
  onDelete: () => void;
  models: readonly string[];
  model: string;
  onModelChange: (model: string) => void;
}

export function ChatHeader({
  title,
  deleteDisabled,
  onRename,
  onDelete,
  // models,
  // model,
  // onModelChange,
}: ChatHeaderProps) {
  const [editing, setEditing] = useState(false);

  return (
    <Group justify="space-between" wrap="nowrap" gap="md" flex={1} miw={0}>
      <Group gap="xs" wrap="nowrap" miw={0} flex={1}>
        <Text size="sm" fw={700} c="var(--chat-title)" style={{ flexShrink: 0 }}>
          Chat
        </Text>
        {title !== undefined && (
          <>
            <Text size="sm" c="var(--chat-muted)" aria-hidden style={{ flexShrink: 0 }}>
              /
            </Text>
            {editing ? (
              <TitleInput title={title} onRename={onRename} onDone={() => setEditing(false)} />
            ) : (
              <Menu position="bottom-start" withinPortal>
                <Menu.Target>
                  <UnstyledButton aria-label={`Actions for ${title}`} title={title} miw={0}>
                    <Group gap={4} wrap="nowrap" miw={0}>
                      <Text size="sm" truncate="end">
                        {title}
                      </Text>
                      <IconChevronDown
                        size={16}
                        color="var(--chat-accent)"
                        style={{ flexShrink: 0 }}
                      />
                    </Group>
                  </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconPencil size={14} />}
                    onClick={() => setEditing(true)}
                  >
                    Rename
                  </Menu.Item>
                  <Menu.Item
                    color="var(--chat-error)"
                    leftSection={<IconTrash size={14} />}
                    disabled={deleteDisabled}
                    onClick={onDelete}
                  >
                    Delete
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </>
        )}
      </Group>
      {/* the agent offers one model for now; put the picker back when it offers more
      <Select
        data={models}
        value={model}
        onChange={(next) => next && onModelChange(next)}
        allowDeselect={false}
        aria-label="Model"
        w={{ base: 150, sm: 310 }}
        rightSection={<IconChevronDown size={18} color="var(--chat-accent)" />}
        comboboxProps={{ withinPortal: true }}
      />
      */}
    </Group>
  );
}
