
export interface RNASeqConfiguration {
    label?: string;
}

export interface PlotPoint {
    umap_x: number;
    umap_y: number;
    group: string;
    metadata: Record<string, any>;
}
