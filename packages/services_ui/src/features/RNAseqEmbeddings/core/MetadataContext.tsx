import React, { createContext, useContext, useMemo, useState } from "react";

interface Dataset {
    metadata: Record<string, any>[];
    zipFile: File;
}

interface MetadataContextValue {
    metadata: Record<string, any>[];
    zipFile: File | null;
    setDataset: (dataset: Dataset) => void;
}

const MetadataContext = createContext<MetadataContextValue | undefined>(undefined);

export const MetadataProvider = ({
    children,
    initialDataset = null,
}: {
    children: React.ReactNode;
    initialDataset?: Dataset | null;
}) => {
    // metadata and zip are always set together, so they live in one state value
    const [dataset, setDataset] = useState<Dataset | null>(initialDataset);
    const value = useMemo<MetadataContextValue>(
        () => ({
            metadata: dataset?.metadata ?? [],
            zipFile: dataset?.zipFile ?? null,
            setDataset,
        }),
        [dataset],
    );
    return <MetadataContext.Provider value={value}>{children}</MetadataContext.Provider>;
};

export const useMetadata = (): MetadataContextValue => {
    const context = useContext(MetadataContext);
    if (!context) {
        throw new Error("useMetadata must be used within a MetadataProvider");
    }
    return context;
};

export default MetadataContext;
