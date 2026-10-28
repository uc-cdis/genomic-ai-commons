import React, { createContext, useContext, useState } from "react";
import type { DataFileBundle } from "./types";

interface DataFileBundlesContextValue {
    bundles: DataFileBundle[];
    setBundles: React.Dispatch<React.SetStateAction<DataFileBundle[]>>;
}

const DataFileBundlesContext = createContext<DataFileBundlesContextValue | undefined>(undefined);

export const DataFileBundlesProvider = ({
    children,
    initialBundles = [],
}: {
    children: React.ReactNode;
    initialBundles?: DataFileBundle[];
}) => {
    const [bundles, setBundles] = useState<DataFileBundle[]>(initialBundles);
    return (
        <DataFileBundlesContext.Provider value={{ bundles, setBundles }}>
            {children}
        </DataFileBundlesContext.Provider>
    );
};

export const useDataFileBundles = (): DataFileBundlesContextValue => {
    const context = useContext(DataFileBundlesContext);
    if (!context) {
        throw new Error("useDataFileBundles must be used within a DataFileBundlesProvider");
    }
    return context;
};

export default DataFileBundlesContext;
