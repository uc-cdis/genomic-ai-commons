"use client";

import { memo } from "react";
import ReactMarkdown, { type Components, type Options } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Typography } from "@mantine/core";
import { isAgentDownloadLink } from "../../core/downloadLinks";
import { normalizeMath } from "./normalizeMath";

const components: Components = {
  table: ({ children }) => (
    <div style={{ overflowX: "auto", maxWidth: "100%" }}>
      <table>{children}</table>
    </div>
  ),
  // an agent download saves in place, so an expired link can't navigate away mid-answer;
  // links within the answer (footnotes) stay put; any other link opens a new tab
  a: ({ node: _node, children, ...props }) => {
    if (isAgentDownloadLink(props.href))
      return (
        <a {...props} download>
          {children}
        </a>
      );
    if (props.href?.startsWith("#")) return <a {...props}>{children}</a>;
    return (
      <a {...props} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
};
const remarkPlugins: Options["remarkPlugins"] = [remarkGfm, remarkMath];
const rehypePlugins: Options["rehypePlugins"] = [[rehypeKatex, { output: "mathml" }]];

// memo: skip redraws when the text hasn't changed, so older messages don't
// re-parse their markdown every time a new word streams in
export const MarkdownContent = memo(function MarkdownContent({
  content,
  fz = "sm",
}: {
  content: string;
  /** "xs" for agent steps; answers keep "sm" */
  fz?: "xs" | "sm";
}) {
  return (
    <Typography fz={fz} className="chat-markdown">
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {normalizeMath(content)}
      </ReactMarkdown>
    </Typography>
  );
});
