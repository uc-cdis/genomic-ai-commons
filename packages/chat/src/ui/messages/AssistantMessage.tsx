"use client";

import { Fragment, useState } from "react";
import { Stack } from "@mantine/core";
import type { ChatMessage, Timings } from "../../core";
import { MessageBubble } from "./MessageBubble";
import { ToolCallPanel } from "./ToolCallPanel";
import { ToolResultCard } from "../tools";

type AssistantChatMessage = Extract<ChatMessage, { role: "assistant" }>;

export interface AssistantMessageProps {
  message: AssistantChatMessage;
  timings: Timings;
  toolResults: ReadonlyMap<string, string>;
  isRunning: boolean;
}

export function AssistantMessage({
  message,
  timings,
  toolResults,
  isRunning,
}: AssistantMessageProps) {
  const [openedCallId, setOpenedCallId] = useState<string | null>(null);

  return (
    <Stack gap="xs">
      {(message.toolCalls ?? []).map((tc) => {
        const result = toolResults.get(tc.id) ?? null;

        return (
          <Fragment key={tc.id}>
            <ToolCallPanel
              toolCall={tc}
              result={result}
              isRunning={isRunning}
              durationMs={timings.tools?.[tc.id]}
              isExpanded={openedCallId === tc.id}
              onToggle={() => setOpenedCallId(openedCallId === tc.id ? null : tc.id)}
            />
            <ToolResultCard toolCall={tc} result={result} isRunning={isRunning} />
          </Fragment>
        );
      })}

      {message.content && <MessageBubble message={{ ...message, toolCalls: undefined }} />}
    </Stack>
  );
}
