import type { ChatRecord } from "../core";

export const CHAT_MAX_WIDTH = 820;
export const HEADER_HEIGHT = 48;

export function formatDuration(ms: number): string {
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`;
}

export function formatJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

export function groupChatsByDay(
  chats: ChatRecord[],
  now: number = Date.now(),
): { label: string; chats: ChatRecord[] }[] {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  // the calendar day before, not 24 hours before: a day is 23 or 25 hours when clocks change
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const todayStart = today.getTime();
  const yesterdayStart = yesterday.getTime();

  const groups = [
    { label: "RECENT SESSIONS", chats: [] as ChatRecord[] },
    { label: "YESTERDAY", chats: [] as ChatRecord[] },
    { label: "EARLIER", chats: [] as ChatRecord[] },
  ];

  for (const chat of chats) {
    const bucket = chat.updatedAt >= todayStart ? 0 : chat.updatedAt >= yesterdayStart ? 1 : 2;
    groups[bucket].chats.push(chat);
  }

  return groups.filter((group) => group.chats.length > 0);
}

export function searchChats(chats: ChatRecord[], query: string): ChatRecord[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return chats;
  return chats.filter((chat) => chat.title.toLowerCase().includes(needle));
}
