import JSZip from 'jszip';
import type {ProcessZip} from "./core/types";
import type {ExtensionStat} from "./sketch/types";
import {isOsMetadata} from "./isOsMetadata";

// given a zip file or start count process each one a pass it to the passed handler functions

export const processZipFiles : ProcessZip = async  (zipFile, {
    signal,
    onProgress,
    onFile,
    onDone
}) => {

    onProgress(2, 'Reading archive');
    const zip = await JSZip.loadAsync(zipFile);
    signal.throwIfAborted();

    const entries = Object.values(zip.files).filter((f) => !f.dir && !isOsMetadata(f.name));
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
        const s = stats.get(extension) ?? {extension, count: 0, bytes: 0};
        s.count += 1;
        s.bytes += bytes;
        stats.set(extension, s);

        sizes.push({path: entry.name, bytes});
        totalBytes += bytes;

        const percent = 5 + Math.floor(((i + 1) / entries.length) * 90);
        if (percent !== lastPercent) {
            lastPercent = percent;
            onProgress(percent, `Analyzing files (${i + 1} of ${entries.length})`);
        }
    }
}
