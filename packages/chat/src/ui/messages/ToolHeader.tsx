"use client";

import { Group, Loader, Text, UnstyledButton } from "@mantine/core";
import {
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
  IconCircleX,
  IconTool,
} from "@tabler/icons-react";
import { formatDuration } from "../util";
import { STATUS_LABELS, type ToolStatus } from "./toolStatus";

function StatusPill({ status, label }: { status: ToolStatus; label?: string }) {
  return (
    <span className="chat-status" data-status={status}>
      {status === "completed" && <IconCircleCheck size={14} />}
      {status === "error" && <IconCircleX size={14} />}
      {status === "running" && <Loader size={10} type="dots" color="var(--chat-primary)" />}
      {label ?? STATUS_LABELS[status]}
    </span>
  );
}

export interface ToolHeaderProps {
  name: string;
  count?: number;
  durationMs?: number;
  status: ToolStatus;
  statusLabel?: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export function ToolHeader({
  name,
  count,
  durationMs,
  status,
  statusLabel,
  isExpanded,
  onToggle,
}: ToolHeaderProps) {
  return (
    <UnstyledButton onClick={onToggle} aria-expanded={isExpanded} w="100%" display="block">
      <Group justify="space-between" p="xs">
        <Group gap="xs">
          <IconTool size={16} color="var(--chat-icon)" />
          <Text
            size="sm"
            ff="monospace"
            fw={500}
            c="var(--chat-tool-name)"
            bg="var(--chat-tint)"
            px={6}
            style={{ borderRadius: "var(--mantine-radius-sm)" }}
          >
            {name}
          </Text>
          {count !== undefined && (
            <Text size="sm" fw={600} c="var(--chat-muted)">
              ×{count}
            </Text>
          )}
        </Group>

        <Group gap="sm">
          {durationMs !== undefined && (
            <Text size="xs" c="var(--chat-muted)">
              {formatDuration(durationMs)}
            </Text>
          )}
          <StatusPill status={status} label={statusLabel} />
          {isExpanded ? (
            <IconChevronUp size={16} color="var(--chat-accent)" />
          ) : (
            <IconChevronDown size={16} color="var(--chat-accent)" />
          )}
        </Group>
      </Group>
    </UnstyledButton>
  );
}
