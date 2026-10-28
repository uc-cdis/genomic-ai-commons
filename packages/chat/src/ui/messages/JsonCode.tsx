"use client";

import { Code } from "@mantine/core";
import { memo, useMemo } from "react";
import { jsonTokens } from "../util";

// memo: every streamed word re-renders every tool panel, closed ones too
export const JsonCode = memo(function JsonCode({ text }: { text: string }) {
  const tokens = useMemo(() => jsonTokens(text), [text]);

  return (
    <Code block mah={300} className="chat-code" style={{ overflow: "auto" }}>
      {tokens
        ? tokens.map((token, i) => (
            <span key={i} className={`chat-json-${token.kind}`}>
              {token.text}
            </span>
          ))
        : text}
    </Code>
  );
});
