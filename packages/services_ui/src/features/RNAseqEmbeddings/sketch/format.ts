export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[i]}`;
}

export function formatStarted(ts: number): string {
  return new Date(ts).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

export function formatDuration(startedAt: number, finishedAt?: number): string {
  if (!finishedAt) return '';
  const s = Math.max(0, (finishedAt - startedAt) / 1000);
  return s < 60 ? `${s.toFixed(1)} s` : `${Math.floor(s / 60)} min ${Math.round(s % 60)} s`;
}
