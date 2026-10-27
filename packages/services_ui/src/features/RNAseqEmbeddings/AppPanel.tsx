import React from 'react';
import {Group, Stack, Tabs} from "@mantine/core";
import LoadedFiles from "./LoadedFiles";
import DropZone from "./DropZone";
import { PiGraphLight } from "react-icons/pi";
import { VscServerProcess } from "react-icons/vsc";
import { ImTable } from "react-icons/im";
import MetadataPanel from "./MetadataPanel";

const App = () => {
  return (
    <div className="flex nowrap w-full h-full">
        <div className="flex flex-col w-1/4 min-w-[300px]">
            <LoadedFiles/>
            <DropZone/>
        </div>
        <Tabs classNames={{root: "w-full h-full"}}>
            <Tabs.List>
                <Tabs.Tab value="metadata" leftSection={<ImTable size={12} />}>
                    Metadata
                </Tabs.Tab>
                <Tabs.Tab value="processing" leftSection={<VscServerProcess size={12} />}>
                    Processing
                </Tabs.Tab>
                <Tabs.Tab value="results" leftSection={<PiGraphLight size={12} />}>
                    Results
                </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="metadata">
                <MetadataPanel/>
            </Tabs.Panel>

            <Tabs.Panel value="processing">
                Messages tab content
            </Tabs.Panel>

            <Tabs.Panel value="results">
                Settings tab content
            </Tabs.Panel>
        </Tabs>
    </div>
  );
};

export default App;
