import { inspectCsv } from './inspectCsv';
import { inspectTsv } from './inspectTsv';
import { inspectZip } from './sketch/inspectZip';
import type { ProcessZip } from './sketch/types';

/** Picks the processor from the file extension (MIME types are unreliable for .tsv and .csv). */
export const processFile: ProcessZip = (file, ctx) => {
  const name = file.name.toLowerCase();
  if (name.endsWith('.zip')) return inspectZip(file, ctx);
  if (name.endsWith('.tsv')) return inspectTsv(file, ctx);
  if (name.endsWith('.csv')) return inspectCsv(file, ctx);
  return Promise.reject(new Error('Unsupported file type. Use a .zip, .tsv or .csv file.'));
};
