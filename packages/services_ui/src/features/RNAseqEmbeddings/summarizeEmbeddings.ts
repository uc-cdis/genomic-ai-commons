import type { EmbeddingResult } from './processing/embedZipFiles';

export const QC_COLUMNS = ['n_genes_vocab', 'n_genes_matched', 'n_genes_absent', 'n_genes_unknown'] as const;
export const DESCRIBE_STATS = ['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max'] as const;

type QcColumn = (typeof QC_COLUMNS)[number];
type DescribeStat = (typeof DESCRIBE_STATS)[number];

export interface EmbeddingSummary {
    /** [number of embeddings, embedding dimension], like X_input.shape */
    shape: [number, number];
    encoders: string[];
    /** equivalent of pandas DataFrame.describe() for the QC columns */
    describe: Record<QcColumn, Record<DescribeStat, number>>;
}

// linear interpolation between closest ranks, same as pandas/numpy default
const quantile = (sorted: number[], q: number): number => {
    const pos = (sorted.length - 1) * q;
    const lo = Math.floor(pos);
    const hi = Math.ceil(pos);
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
};

const describeColumn = (values: number[]): Record<DescribeStat, number> => {
    const sorted = [...values].sort((a, b) => a - b);
    const count = sorted.length;
    const mean = sorted.reduce((s, v) => s + v, 0) / count;
    // sample standard deviation (ddof = 1), NaN for a single value, as in pandas
    const std = count > 1 ? Math.sqrt(sorted.reduce((s, v) => s + (v - mean) ** 2, 0) / (count - 1)) : NaN;
    return {
        count,
        mean,
        std,
        min: sorted[0],
        '25%': quantile(sorted, 0.25),
        '50%': quantile(sorted, 0.5),
        '75%': quantile(sorted, 0.75),
        max: sorted[count - 1],
    };
};

export const summarizeEmbeddings = (results: EmbeddingResult[]): EmbeddingSummary => {
    const rows = results.map((r) => r.result);
    return {
        shape: [rows.length, rows[0]?.embedding?.length ?? 0],
        encoders: [...new Set(rows.map((r) => String(r.encoder)))],
        describe: Object.fromEntries(
            QC_COLUMNS.map((c) => [c, describeColumn(rows.map((r) => Number(r[c])))]),
        ) as EmbeddingSummary['describe'],
    };
};
