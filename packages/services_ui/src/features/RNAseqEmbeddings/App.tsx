import React from "react";
import AppPanel from "./AppPanel";
import { DataFileBundlesProvider } from "./core/DataFileBundlesContext";
import { MetadataProvider } from "./core/MetadataContext";

const App = () => {
  return (
      <DataFileBundlesProvider>
        <MetadataProvider>
          <AppPanel/>
        </MetadataProvider>
      </DataFileBundlesProvider>
  );
};

export default App;
