/** Splits CSV text into records of fields. Quoted fields may contain commas, newlines and "" escapes. */
const parseCsv = (text: string): string[][] => {
  const records: string[][] = [];
  let record: string[] = [];
  let field = '';
  let inQuotes = false;
  let recordHasContent = false;

  const endRecord = () => {
    if (recordHasContent) {
      record.push(field);
      records.push(record);
    }
    record = [];
    field = '';
    recordHasContent = false;
  };

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') inQuotes = false;
      else field += ch;
    } else if (ch === '"') {
      inQuotes = true;
      recordHasContent = true;
    } else if (ch === ',') {
      record.push(field);
      field = '';
      recordHasContent = true;
    } else if (ch === '\n' || ch === '\r') {
      endRecord(); // "\r\n" ends the record on \r; the \n then sees no content
    } else {
      field += ch;
      recordHasContent = true;
    }
  }
  if (inQuotes) throw new Error('The file ends inside a quoted field.');
  endRecord();
  return records;
};

/**
 * Loads a CSV file into memory: one record per data row, keyed by the header row's column names.
 * Values are left as strings.
 */
export const loadCsv = async (file: File): Promise<Record<string, any>[]> => {
  // a UTF-8 BOM would otherwise end up in the first column name
  const text = (await file.text()).replace(/^﻿/, '');
  const [header, ...rows] = parseCsv(text);
  if (!header) throw new Error('The file has no header row.');
  return rows.map((cells) => Object.fromEntries(header.map((name, i) => [name, cells[i] ?? ''])));
};
