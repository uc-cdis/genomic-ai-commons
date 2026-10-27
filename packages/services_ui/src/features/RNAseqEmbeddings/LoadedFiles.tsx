import React, {useMemo} from 'react';
import {Stack, Text} from "@mantine/core";
import { formatDate } from "../../utils/date";

const SAMPLE_FILES = {
    "file1": {
        name: "file1",
        uploadedAt: "2023-01-01"
    },
    "file2": {
        name: "file2",
        uploadedAt: "2023-01-02"
    }
}

interface FileCardProps {
    name: string;
    uploadedAt: string
}

const FileCard = ({ name, uploadedAt} : FileCardProps) => {
  return (
    <div className="flex flex-col border-base-light border-1 rounded-sm">
        <Text size="md" fw={600}>{name}</Text>
        <Text size="sm">{formatDate(uploadedAt)}</Text>
    </div>);
};


const LoadedFiles = () => {

    const fileItems = useMemo(() => Object.values(SAMPLE_FILES).map((file) => <FileCard key={file.name} name={file.name}
                                                                                       uploadedAt={file.uploadedAt}/>)
        , []);

    return (<Stack gap="xs">
        {fileItems}
    </Stack>);
}

export default LoadedFiles;
