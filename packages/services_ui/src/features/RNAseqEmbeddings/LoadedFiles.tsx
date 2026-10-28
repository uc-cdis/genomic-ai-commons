import React, {useMemo} from 'react';
import {Stack, Text} from "@mantine/core";
import { formatDate } from "../../utils/date";
import type {DataFileBundle, InputFile} from "./core/types";
import {useDataFileBundles} from "./core/DataFileBundlesContext";


interface FileCardProps {
 file: InputFile;

}

const FileCard = ({ file } : FileCardProps) => {
    const {name, type, uploadedAt} = file;
  return (
    <div className="flex flex-col border-base-light border-1 m-1">
        <div className="flex justify-between"> <Text size="md" fw={600}>{name}</Text><Text size="sm">{type}</Text></div>
        <Text size="sm">{formatDate(uploadedAt)}</Text>
    </div>);
};

interface FileBundleCardProps {
 bundle: DataFileBundle;
}

const FileBundleCard = ({ bundle } : FileBundleCardProps) => {
    return (
        <div className="flex flex-col border-base-light border-1 m-1">
            <FileCard file={bundle.zipFile}/>
            <FileCard file={bundle.metadataFile}/>
        </div>);
};


const LoadedFiles = () => {

    const { bundles } = useDataFileBundles()
    const fileItems = useMemo(() => bundles.map((bundle) => <FileBundleCard key={bundle.id} bundle={bundle} />), [bundles]);

    return (<Stack gap="xs">
        <Text fw={600}>Loaded Files</Text>
        <div className="flex flex-col border-base-light border-1 rounded-sm gap-y-2">
        {fileItems}
        </div>
    </Stack>);
}

export default LoadedFiles;
