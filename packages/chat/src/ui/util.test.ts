import { describe, expect, it } from "vitest";
import type { ChatRecord } from "../core";
import { groupChatsByDay } from "./util";

// clocks went forward here on 9 March 2025, so the midnight test means something on CI too
process.env.TZ = "America/New_York";
const HOUR = 3_600_000;
const NOW = new Date(2025, 2, 10, 12, 0).getTime();
const chat = (id: string, title: string, updatedAt: number): ChatRecord => ({
  id,
  title,
  titleAuto: true,
  createdAt: updatedAt,
  updatedAt,
});

describe("groupChatsByDay", () => {
  it("groups chats into today, yesterday and earlier, keeping their order", () => {
    const chats = [
      chat("a", "KRAS in lung", NOW - 1 * HOUR),
      chat("b", "BRAF survival", NOW - 3 * HOUR),
      chat("c", "TP53 burden", NOW - 20 * HOUR), // yesterday, 4 pm
      chat("d", "BRCA variants", NOW - 5 * 24 * HOUR),
    ];
    expect(groupChatsByDay(chats, NOW)).toEqual([
      { label: "TODAY", chats: [chats[0], chats[1]] },
      { label: "YESTERDAY", chats: [chats[2]] },
      { label: "EARLIER", chats: [chats[3]] },
    ]);
  });

  it("starts yesterday at midnight even when the clocks changed overnight", () => {
    // vitest's thread pool ignores a TZ set at runtime; this fails instead of passing for nothing
    expect(new Date(NOW).getTimezoneOffset()).toBe(240);
    const lateOnThe8th = chat("e", "EGFR in lung", new Date(2025, 2, 8, 23, 30).getTime());
    expect(groupChatsByDay([lateOnThe8th], NOW)).toEqual([
      { label: "EARLIER", chats: [lateOnThe8th] },
    ]);
  });

  it("leaves out groups with no chats", () => {
    const old = chat("d", "BRCA variants", NOW - 5 * 24 * HOUR);
    expect(groupChatsByDay([old], NOW)).toEqual([{ label: "EARLIER", chats: [old] }]);
  });
});
