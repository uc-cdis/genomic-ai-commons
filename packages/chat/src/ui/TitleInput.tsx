"use client";

import { useState } from "react";
import { TextInput } from "@mantine/core";

export function TitleInput({
  title,
  onRename,
  onDone,
}: {
  title: string;
  onRename: (title: string) => void;
  onDone: () => void;
}) {
  const [draft, setDraft] = useState(title);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== title) onRename(trimmed);
    onDone();
  };

  return (
    <TextInput
      size="xs"
      /* oxlint-disable-next-line jsx-a11y/no-autofocus */
      autoFocus
      flex={1}
      data-keep-open
      value={draft}
      aria-label="Conversation title"
      onChange={(event) => setDraft(event.currentTarget.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          commit();
        }
        if (event.key === "Escape") onDone();
      }}
    />
  );
}
