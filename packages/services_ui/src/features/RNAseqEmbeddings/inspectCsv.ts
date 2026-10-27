import { PREVIEW_COLUMN_LIMIT, PREVIEW_ROW_LIMIT, type ProcessZip } from './sketch/types';

/** Splits one CSV record on commas outside quotes, unwrapping "" escapes. */
const parseRecord = (record: string): string[] => {
  const fields: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < record.length; i += 1) {
    const ch = record[i];
    if (inQuotes) {
      if (ch === '"' && record[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') inQuotes = false;
      else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') {
      fields.push(field);
      field = '';
    } else field += ch;
  }
  fields.push(field);
  return fields;
};

/**
 * Stand-in processor for a single CSV: streams the file in the browser and
 * counts rows and columns. Quoted fields may contain commas and newlines.
 * Replace with your real pipeline; keep the signature.
 */
export const inspectCsv: ProcessZip = async (file, { signal, onProgress }) => {
  onProgress(2, 'Reading file');
  if (file.size === 0) throw new Error('The file is empty.');

  const reader = file.stream().getReader();
  const decoder = new TextDecoder();
  let header: string | null = null;
  let rowCount = 0;
  let inQuotes = false;
  const sample: string[] = [];
  let record = ''; // kept only for the header and the sampled rows
  let recordHasContent = false;
  let read = 0;
  let lastPercent = -1;

  const endRecord = () => {
    if (recordHasContent) {
      if (header === null) header = record;
      else {
        rowCount += 1;
        if (sample.length < PREVIEW_ROW_LIMIT) sample.push(record);
      }
    }
    record = '';
    recordHasContent = false;
  };

  const consume = (text: string) => {
    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i];
      if (ch === '"') inQuotes = !inQuotes; // an escaped "" toggles twice
      if (!inQuotes && (ch === '\n' || ch === '\r')) {
        endRecord(); // "\r\n" ends a record on \r, the \n then sees no content
        continue;
      }
      recordHasContent = true;
      if (header === null || sample.length < PREVIEW_ROW_LIMIT) record += ch;
    }
  };

  try {
    for (;;) {
      signal.throwIfAborted();
      const { done, value } = await reader.read();
      if (done) break;
      read += value.byteLength;
      consume(decoder.decode(value, { stream: true }));

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
  consume(decoder.decode());
  if (inQuotes) throw new Error('The file ends inside a quoted field.');
  endRecord();

  if (header === null) throw new Error('The file has no header row.');
  if (rowCount === 0) throw new Error('The file has a header but no data rows.');

  // a UTF-8 BOM would otherwise end up in the first column name
  const allColumns = parseRecord((header as string).replace(/^\uFEFF/, ''));
  const columns = allColumns.slice(0, PREVIEW_COLUMN_LIMIT);
  const rows = sample.map((rec) => {
    const cells = parseRecord(rec);
    return Object.fromEntries(columns.map((name, i) => [name, cells[i] ?? '']));
  });
  return {
    entryCount: 1,
    totalBytes: file.size,
    byExtension: [{ extension: 'csv', count: 1, bytes: file.size }],
    largest: [{ path: file.name, bytes: file.size }],
    table: {
      rowCount,
      columnCount: allColumns.length,
      columns,
      rows,
    },
  };
};
