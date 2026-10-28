"use client";

import { Code, Collapse, Group, Loader, Paper, Stack, Text, UnstyledButton } from "@mantine/core";
import {
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
  IconCircleX,
  IconTool,
} from "@tabler/icons-react";
import { useMemo } from "react";
import type { ToolCall } from "../../core";
import { DownloadButton, findDownload } from "../tools";
import { formatDuration, formatJson } from "../util";

const STATUS_LABELS = {
  completed: "Completed",
  error: "Error",
  running: "Running",
  missing: "No result",
};

function StatusPill({ status }: { status: keyof typeof STATUS_LABELS }) {
  return (
    <span className="chat-status" data-status={status}>
      {status === "completed" && <IconCircleCheck size={14} />}
      {status === "error" && <IconCircleX size={14} />}
      {status === "running" && <Loader size={10} type="dots" color="var(--chat-primary)" />}
      {STATUS_LABELS[status]}
    </span>
  );
}

export interface ToolCallPanelProps {
  toolCall: ToolCall;
  result: string | null;
  failed: boolean;
  /** A call with no result is only pending while a run is in flight. */
  isRunning: boolean;
  durationMs?: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export function ToolCallPanel({
  toolCall,
  result,
  failed,
  isRunning,
  durationMs,
  isExpanded,
  onToggle,
}: ToolCallPanelProps) {
  // create_filter's filter, as a file; survival curves and manifests get their own cards
  const filter = useMemo(() => findDownload(result, "filter"), [result]);

  return (
    <Paper withBorder radius="sm" bg="var(--mantine-color-default)" style={{ overflow: "hidden" }}>
      <UnstyledButton onClick={onToggle} aria-expanded={isExpanded} w="100%" display="block">
        <Group
          justify="space-between"
          p="xs"
          bg={isExpanded ? "var(--mantine-color-default-hover)" : "transparent"}
        >
          <Group gap="xs">
            <IconTool size={16} color="var(--mantine-color-gray-6)" />
            <Text size="sm" ff="monospace" fw={500}>
              {toolCall.name}
            </Text>
          </Group>

          <Group gap="sm">
            {durationMs !== undefined && (
              <Text size="xs" c="dimmed">
                {formatDuration(durationMs)}
              </Text>
            )}
            <StatusPill
              status={failed ? "error" : result ? "completed" : isRunning ? "running" : "missing"}
            />
            {isExpanded ? (
              <IconChevronUp size={16} color="var(--chat-accent)" />
            ) : (
              <IconChevronDown size={16} color="var(--chat-accent)" />
            )}
          </Group>
        </Group>
      </UnstyledButton>

      <Collapse expanded={isExpanded}>
        <Stack
          p="sm"
          gap="xs"
          bg="var(--mantine-color-body)"
          bd="1px solid var(--mantine-color-default-border)"
          style={{ borderBottom: "none", borderLeft: "none", borderRight: "none" }}
        >
          <Text size="xs" fw={700} c="dimmed">
            PARAMETERS
          </Text>
          {toolCall.args ? (
            <Code block mah={300} style={{ overflow: "auto" }}>
              {JSON.stringify(toolCall.args, null, 2)}
            </Code>
          ) : (
            <Text size="xs" c="dimmed">
              Waiting for arguments…
            </Text>
          )}

          {result ? (
            <>
              <Text size="xs" fw={700} c="dimmed" mt="xs">
                {failed ? "ERROR" : "RESULT"}
              </Text>
              <Code block mah={300} style={{ overflow: "auto" }}>
                {formatJson(result)}
              </Code>
              {filter && (
                <div>
                  <DownloadButton href={filter.url} label="Download filter (JSON)" />
                </div>
              )}
            </>
          ) : (
            !isRunning && (
              <Text size="xs" c="dimmed" mt="xs">
                The run ended without a result for this call.
              </Text>
            )
          )}
        </Stack>
      </Collapse>
    </Paper>
  );
}
