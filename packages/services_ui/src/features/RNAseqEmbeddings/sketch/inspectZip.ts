import JSZip from 'jszip';
import type { ExtensionStat, ProcessZip } from './types';

/**
 * Stand-in processor: opens the archive in the browser and tallies entries by
 * file type. Replace with your real pipeline; keep the signature.
 */
export const inspectZip: ProcessZip = async (file, { signal, onProgress }) => {
  onProgress(2, 'Reading archive');
  const zip = await JSZip.loadAsync(file);
  signal.throwIfAborted();

  const entries = Object.values(zip.files).filter((f) => !f.dir);
  if (entries.length === 0) throw new Error('The archive contains no files.');

  const stats = new Map<string, ExtensionStat>();
  const sizes: { path: string; bytes: number }[] = [];
  let totalBytes = 0;
  let lastPercent = -1;

  for (let i = 0; i < entries.length; i += 1) {
    signal.throwIfAborted();
    const entry = entries[i];
    const bytes = (await entry.async('uint8array')).byteLength;

    const dot = entry.name.lastIndexOf('.');
    const extension = dot > entry.name.lastIndexOf('/') ? entry.name.slice(dot + 1).toLowerCase() : '(none)';
    const s = stats.get(extension) ?? { extension, count: 0, bytes: 0 };
    s.count += 1;
    s.bytes += bytes;
    stats.set(extension, s);

    sizes.push({ path: entry.name, bytes });
    totalBytes += bytes;

    const percent = 5 + Math.floor(((i + 1) / entries.length) * 90);
    if (percent !== lastPercent) {
      lastPercent = percent;
      onProgress(percent, `Analyzing files (${i + 1} of ${entries.length})`);
    }
  }

  return {
    entryCount: entries.length,
    totalBytes,
    byExtension: [...stats.values()].sort((a, b) => b.bytes - a.bytes),
    largest: sizes.sort((a, b) => b.bytes - a.bytes).slice(0, 8),
  };
};
