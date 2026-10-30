import React, {useCallback, useMemo, useState} from "react";
import {Button, Progress, Stack, Table, Text} from '@mantine/core';
import { DESCRIBE_STATS, QC_COLUMNS, summarizeEmbeddings } from "./summarizeEmbeddings";
import {useMetadata} from "./core/MetadataContext";
import type { EmbeddingResult } from "./processing/embedZipFiles";
import { embedZipFiles } from "./processing/embedZipFiles";

const formatNumber = (n: number) => (Number.isNaN(n) ? 'NaN' : Number.isInteger(n) ? n.toString() : n.toFixed(2));

const ProcessPanel = () => {

  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingError, setIsProcessingError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<EmbeddingResult[]>([]);

  const {
    zipFile
  } = useMetadata();

  const handleGenerateEmbeddings = async () => {
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


  const summary = useMemo(
    () => (results.length > 0 ? summarizeEmbeddings(results) : null),
    [results],
  );

  return (<div className="flex flex-col space-y-2 m-2 p-1">

    <div className="h-5 w-full m-1 p1">
    {isProcessing && <Progress value={progress} />}
    </div>
    <div className="border-1 border-base-light p-2">
    <Button onClick={handleGenerateEmbeddings} loading={isProcessing} disabled={!zipFile}>Generate Embeddings</Button>
    </div>
    {isProcessingError && <Text c="red">Processing failed. See the console for details.</Text>}
    {summary && (
      <Stack gap="xs" className="border-1 border-base-light p-2">
        <Text>
          embeddings: ({summary.shape.join(', ')}), encoder: {summary.encoders.join(', ')}
        </Text>
        <Table withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th />
              {QC_COLUMNS.map((c) => <Table.Th key={c}>{c}</Table.Th>)}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {DESCRIBE_STATS.map((stat) => (
              <Table.Tr key={stat}>
                <Table.Th>{stat}</Table.Th>
                {QC_COLUMNS.map((c) => (
                  <Table.Td key={c}>{formatNumber(summary.describe[c][stat])}</Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Stack>
    )}
    </div>);
};

export default ProcessPanel;
