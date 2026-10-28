"use client";

import { ActionIcon, CopyButton, Tooltip } from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons-react";

export function CopyAction({ value, label }: { value: string; label: string }) {
  return (
    <CopyButton value={value} timeout={2000}>
      {({ copied, copy }) => (
        <Tooltip label={copied ? "Copied" : "Copy"} withArrow position="top">
          <ActionIcon
            variant="subtle"
            color={copied ? "var(--chat-success)" : "var(--chat-action)"}
            size="sm"
            aria-label={copied ? "Copied to clipboard" : label}
            onClick={copy}
          >
            {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
          </ActionIcon>
        </Tooltip>
      )}
    </CopyButton>
  );
}
