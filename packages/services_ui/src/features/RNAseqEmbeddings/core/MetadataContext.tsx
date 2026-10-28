import React, { createContext, useContext, useState } from "react";

interface MetadataContextValue {
    metadata: Record<string, any>[];
    setMetadata: React.Dispatch<React.SetStateAction<Record<string, any>[]>>;
}

const MetadataContext = createContext<MetadataContextValue | undefined>(undefined);

export const MetadataProvider = ({
    children,
    initialMetadata = [],
}: {
    children: React.ReactNode;
    initialMetadata?: Record<string, any>[];
}) => {
    const [metadata, setMetadata] = useState<Record<string, any>[]>(initialMetadata);
    return (
        <MetadataContext.Provider value={{ metadata, setMetadata }}>
            {children}
        </MetadataContext.Provider>
    );
};

export const useMetadata = (): MetadataContextValue => {
    const context = useContext(MetadataContext);
    if (!context) {
        throw new Error("useMetadata must be used within a MetadataProvider");
    }
    return context;
};

export default MetadataContext;
