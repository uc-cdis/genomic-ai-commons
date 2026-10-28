import { Paper, Text } from "@mantine/core";
import type { ChatMessage } from "../../core";

export interface UserBubbleProps {
  message: ChatMessage;
}

export function UserBubble({ message }: UserBubbleProps) {
  return (
    <Paper
      px="md"
      py="xs"
      radius="lg"
      maw="80%"
      bg="orange.6"
      c="white"
      style={{ alignSelf: "flex-end" }}
    >
      <Text size="sm" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {message.content}
      </Text>
    </Paper>
  );
}
