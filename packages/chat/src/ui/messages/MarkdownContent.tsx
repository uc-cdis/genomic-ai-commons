"use client";

import { memo } from "react";
import ReactMarkdown, { type Components, type Options } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Typography } from "@mantine/core";
import { isAgentDownloadLink } from "../../core/downloadLinks";
import { DownloadButton } from "../tools";
import { normalizeMath } from "./normalizeMath";

const components: Components = {
  table: ({ children }) => (
    <div style={{ overflowX: "auto", maxWidth: "100%" }}>
      <table>{children}</table>
    </div>
  ),
  a: ({ node: _node, children, ...props }) => {
    // a button like the cards' that saves in place, so an expired link can't navigate away
    if (props.href && isAgentDownloadLink(props.href))
      return <DownloadButton href={props.href} label={children} />;
    // links within the answer (footnotes) stay put
    if (props.href?.startsWith("#")) return <a {...props}>{children}</a>;
    // anything else opens a new tab, so the chat stays
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
