import { useState } from "react";
import {
  Alert,
  Group,
  Text,
} from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import { FileArchive, Upload, X } from "lucide-react";
import "@mantine/dropzone/styles.css";
import {useMetadata} from "./core/MetadataContext";
import {loadCsv} from "./loadCsv";

// extensions are listed too because browsers often report no MIME type for .tsv or .csv
const FILE_TYPES = {
  [MIME_TYPES.zip]: [".zip"],
  "application/x-zip-compressed": [".zip"],
  "text/tab-separated-values": [".tsv"],
  "text/tsv": [".tsv"],
  "text/csv": [".csv"],
};

// function to see if both a zipfile and .csv or .tsv file in the dropzone
const hasValidFiles = (files: File[]) => {
  const zipFile = files.find((file) => file.type === MIME_TYPES.zip);
  const csvOrTsvFile = files.find(
    (file) => {
      if (!file) return false;
      const ext = file.name?.split(".").pop();
      if (!ext) return false;

      return FILE_TYPES["text/csv"].includes(`.${ext}`) || FILE_TYPES["text/tsv"].includes(`.${ext}`)
    }
  );
  return zipFile && csvOrTsvFile;
};

const DropZone = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [staged, setStaged] = useState<Array<File> | null>(null);
  const [rejection, setRejection] = useState<string | null>(null);
  const { setMetadata } = useMetadata();

  const loadMetadata = async (files: File[]) => {
    const csvFile = files.find((file) => file.name.toLowerCase().endsWith(".csv"));
    if (!csvFile) return;
    try {
      setMetadata(await loadCsv(csvFile));
    } catch (error) {
      setRejection(error instanceof Error ? error.message : "Could not read the CSV file.");
    }
  };

  return (
    <>
      <Dropzone
        onDrop={(files) => {
          if (hasValidFiles(files)) {
          setStaged(files);
          notifications.show({
            color: "green",
            title: "Files staged",
            message: `${files.length} files ready to process.`,
          });
          setRejection(null);
          void loadMetadata(files);
          } else {
            setRejection(
              "That file isn’t supported. Choose a .zip archive, .tsv or .csv file.",
            )
          }        }}
        onReject={() =>
          setRejection(
            "That file isn’t supported. Choose a .zip archive, .tsv or .csv file.",
          )
        }
        accept={FILE_TYPES}
        multiple={true}
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
              One .zip archive and metadata .tsv or .csv file
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
