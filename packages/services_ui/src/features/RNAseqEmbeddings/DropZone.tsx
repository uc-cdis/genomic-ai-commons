import { useState } from "react";
import {
  Alert,
  Group,
  Text,
} from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { FileArchive, Upload, X } from "lucide-react";
import "@mantine/dropzone/styles.css";
import { useZipRuns } from "./sketch/useZipRuns";

// extensions are listed too because browsers often report no MIME type for .tsv or .csv
const FILE_TYPES = {
  [MIME_TYPES.zip]: [".zip"],
  "application/x-zip-compressed": [".zip"],
  "text/tab-separated-values": [".tsv"],
  "text/tsv": [".tsv"],
  "text/csv": [".csv"],
};

const DropZone = () => {
  const { runs, start, cancel, remove, clearFinished } = useZipRuns();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [staged, setStaged] = useState<File | null>(null);
  const [rejection, setRejection] = useState<string | null>(null);

  return (
    <>
      <Dropzone
        onDrop={(files) => {
          setRejection(null);
          setStaged(files[0]);
        }}
        onReject={() =>
          setRejection(
            "That file isn’t supported. Choose a .zip archive, .tsv or .csv file.",
          )
        }
        accept={FILE_TYPES}
        multiple={false}
        radius="md"
      >
        <Group
          justify="center"
          gap="md"
          mih={110}
          style={{ pointerEvents: "none" }}
        >
          <Dropzone.Accept>
            <Upload size={32} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <X size={32} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <FileArchive size={32} />
          </Dropzone.Idle>
          <div>
            <Text fw={500}>Drop a .zip, .tsv or .csv file here, or click to browse</Text>
            <Text size="sm" c="dimmed">
              One .zip archive, .tsv or .csv file per run
            </Text>
          </div>
        </Group>
      </Dropzone>
      {rejection && (
        <Alert color="red" mt="sm" role="alert">
          {rejection}
        </Alert>
      )}
    </>
  );
};

export default DropZone;
