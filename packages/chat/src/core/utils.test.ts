import { describe, expect, it } from "vitest";
import type { Message } from "@copilotkit/react-core/v2";
import { shortenTitle, toChatMessage } from "./utils";

describe("toChatMessage", () => {
  it("reads a tool result sent as a string", () => {
    const message: Message = { id: "r1", role: "tool", toolCallId: "t1", content: '{"count":5}' };
    expect(toChatMessage(message)).toEqual([
      { id: "r1", role: "tool", toolCallId: "t1", content: '{"count":5}' },
    ]);
  });

  it("reads a tool result sent as parts (ag-ui 1.0) as the same text", () => {
    const message: Message = {
      id: "r1",
      role: "tool",
      toolCallId: "t1",
      content: [
        { type: "text", text: '{"count":' },
        { type: "text", text: "5}" },
      ],
    };
    expect(toChatMessage(message)).toEqual([
      { id: "r1", role: "tool", toolCallId: "t1", content: '{"count":5}' },
    ]);
  });

  it("parses finished tool arguments and leaves half-streamed ones empty", () => {
    const message: Message = {
      id: "a1",
      role: "assistant",
      content: "Looking up the field.",
      toolCalls: [
        {
          id: "t1",
          type: "function",
          function: { name: "search_fields", arguments: '{"q":"lung"}' },
        },
        { id: "t2", type: "function", function: { name: "get_cases", arguments: '{"filter_id":' } },
      ],
    };
    expect(toChatMessage(message)).toEqual([
      {
        id: "a1",
        role: "assistant",
        content: "Looking up the field.",
        toolCalls: [
          { id: "t1", name: "search_fields", args: { q: "lung" } },
          { id: "t2", name: "get_cases", args: null },
        ],
      },
    ]);
  });

  it("drops empty user and assistant messages", () => {
    expect(toChatMessage({ id: "u1", role: "user", content: "" })).toEqual([]);
    expect(toChatMessage({ id: "a1", role: "assistant", content: "" })).toEqual([]);
  });
});

describe("shortenTitle", () => {
  it("keeps a title of 80 characters or fewer as it is", () => {
    expect(shortenTitle("  What is the 1-year survival estimate for TCGA-CHOL?  ")).toBe(
      "What is the 1-year survival estimate for TCGA-CHOL?",
    );
    const eighty = "x".repeat(80);
    expect(shortenTitle(eighty)).toBe(eighty);
  });

  it("cuts a longer one at the last whole word and marks the cut", () => {
    expect(
      shortenTitle(
        "What is the prevalence of BRAF SSMs in lung cancer cases of non smoking women over 40?",
      ),
    ).toBe("What is the prevalence of BRAF SSMs in lung cancer cases of non smoking women…");
  });

  it("keeps a last word that ends just before the 80th character", () => {
    const title = `${"x".repeat(39)} ${"y".repeat(39)} zzz`;
    expect(shortenTitle(title)).toBe(`${"x".repeat(39)} ${"y".repeat(39)}…`);
  });

  it("cuts a single long word at 80 characters, the mark included", () => {
    expect(shortenTitle("a".repeat(120))).toBe(`${"a".repeat(79)}…`);
  });
});
