import React, { useState } from "react";
import {Button, Progress, Stack} from '@mantine/core';
import {useMetadata} from "./core/MetadataContext";
import type { EmbeddingResult } from "./embedZipFiles";
import { embedZipFiles } from "./embedZipFiles";

const ProcessPanel = () => {

  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingError, setIsProcessingError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<EmbeddingResult[]>([]);

  const {
    zipFile
  } = useMetadata();

  const handleProcess = async () => {
    if (!zipFile) return;
    setIsProcessing(true);
    setIsProcessingError(false);
    setProgress(0);
    try {
      const embeddings = await embedZipFiles(zipFile, {
        signal: new AbortController().signal,
        onProgress: (percent) => setProgress(percent),
      });
      setResults(embeddings);
      setProgress(100);

    } catch (error) {
      console.error(error);
      setIsProcessingError(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (<Stack>
    {isProcessing &&<Progress value={progress} />}
    <Button onClick={handleProcess} loading={isProcessing} disabled={!zipFile}>Process</Button>
    </Stack>);
};

export default ProcessPanel;
