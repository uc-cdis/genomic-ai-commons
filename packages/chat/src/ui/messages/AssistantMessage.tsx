"use client";

import { Fragment, useState } from "react";
import { Box, Stack } from "@mantine/core";
import type { ChatMessage, Timings } from "../../core";
import { AnswerCard } from "./AnswerCard";
import { MarkdownContent } from "./MarkdownContent";
import { ToolCallPanel } from "./ToolCallPanel";
import { ToolResultCard } from "../tools";

type AssistantChatMessage = Extract<ChatMessage, { role: "assistant" }>;

/** The agent's short reason for the tool calls under it: smaller and greyer than an answer. */
function StepText({ content }: { content: string }) {
  return (
    <Box px="xs" className="chat-step">
      <MarkdownContent content={content} fz="xs" />
    </Box>
  );
}

export interface AssistantMessageProps {
  message: AssistantChatMessage;
  timings: Timings;
  toolResults: ReadonlyMap<string, string>;
  isRunning: boolean;
  isStreaming: boolean;
}

export function AssistantMessage({
  message,
  timings,
  toolResults,
  isRunning,
  isStreaming,
}: AssistantMessageProps) {
  const [openedCallId, setOpenedCallId] = useState<string | null>(null);
  const toolCalls = message.toolCalls ?? [];
  // text that comes with tool calls is the agent's reason for them: a step, not the answer
  const isStep = toolCalls.length > 0;

  return (
    <Stack gap="xs">
      {message.content && isStep && <StepText content={message.content} />}
      {message.content && !isStep && (
        <AnswerCard content={message.content} isStreaming={isStreaming} />
      )}

      {toolCalls.map((tc) => {
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
    </Stack>
  );
}
