import { describe, expect, it } from "vitest";
import type { Message } from "@copilotkit/react-core/v2";
import { toChatMessage } from "./utils";

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
