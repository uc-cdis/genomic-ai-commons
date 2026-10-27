import { PREVIEW_COLUMN_LIMIT, PREVIEW_ROW_LIMIT, type ProcessZip } from './sketch/types';

/**
 * Stand-in processor for a single TSV: streams the file in the browser and
 * counts rows and columns. Replace with your real pipeline; keep the signature.
 */
export const inspectTsv: ProcessZip = async (file, { signal, onProgress }) => {
  onProgress(2, 'Reading file');
  if (file.size === 0) throw new Error('The file is empty.');

  const reader = file.stream().getReader();
  const decoder = new TextDecoder();
  let header: string | null = null;
  const sample: string[] = [];
  let rowCount = 0;
  let pending = '';
  let read = 0;
  let lastPercent = -1;

  // a trailing "\r" is dropped so CRLF files don't leak it into the last column
  const takeLine = (line: string) => {
    const clean = line.endsWith('\r') ? line.slice(0, -1) : line;
    if (clean === '') return;
    if (header === null) header = clean;
    else {
      rowCount += 1;
      if (sample.length < PREVIEW_ROW_LIMIT) sample.push(clean);
    }
  };

  try {
    for (;;) {
      signal.throwIfAborted();
      const { done, value } = await reader.read();
      if (done) break;
      read += value.byteLength;
      pending += decoder.decode(value, { stream: true });
      const lines = pending.split('\n');
      pending = lines.pop() ?? '';
      lines.forEach(takeLine);

      const percent = 5 + Math.floor((read / file.size) * 90);
      if (percent !== lastPercent) {
        lastPercent = percent;
        onProgress(Math.min(percent, 95), `Parsing rows (${rowCount.toLocaleString()})`);
      }
    }
  } finally {
    // stops the underlying read when the run is cancelled or fails part way
    void reader.cancel().catch(() => undefined);
  }
  takeLine(pending + decoder.decode());

  if (header === null) throw new Error('The file has no header row.');
  if (rowCount === 0) throw new Error('The file has a header but no data rows.');

  const columns = (header as string).split('\t').slice(0, PREVIEW_COLUMN_LIMIT);
  const rows = sample.map((line) => {
    const cells = line.split('\t');
    return Object.fromEntries(columns.map((name, i) => [name, cells[i] ?? '']));
  });
  return {
    entryCount: 1,
    totalBytes: file.size,
    byExtension: [{ extension: 'tsv', count: 1, bytes: file.size }],
    largest: [{ path: file.name, bytes: file.size }],
    table: {
      rowCount,
      columnCount: (header as string).split('\t').length,
      columns,
      rows,
    },
  };
};
