import React, {useCallback, useState} from "react";
import { useGetAvailableEmbeddingsQuery } from "./core/embeddingsApi";
import { Button, Progress, Text } from "@mantine/core";
import type { UmapComparison} from "./processing/umapEmbeddings";
import {runUmap} from "./processing/umapEmbeddings";
import tcga from './data/full_tcga_embeddings.json'
import input from './data/full_input_embeddings.json'
import UMAPComparisonPlot from "./charts/UMAPComparisonPlot";

const NUM_EPOCHS = 400;


const VisPanel = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingError, setIsProcessingError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [plotData, setPlotData] = useState<UmapComparison | null>(null);

  const setProgressBar = useCallback((value: number) => {
    setProgress(Math.trunc((value / 500) * 100));
  }, []);

  const { data } = useGetAvailableEmbeddingsQuery("expr");

    const handleUmap = async () => {
        setIsProcessing(true);
        setProgress(0);
        const results = await runUmap(tcga, input, setProgressBar);
        setPlotData(results);
        setIsProcessing(false)
    };

  return (
    <div className="flex flex-col space-y-2 m-2 p-1 h-full">
      <div className="h-5 m-1 p1">
        {isProcessing && <Progress value={progress} />}
      </div>
      <div className="border-1 border-base-light p-2">
        <Button onClick={handleUmap} loading={isProcessing}>
          Generate UMAP
        </Button>
      </div>
      {isProcessingError && (
        <Text c="red">Processing failed. See the console for details.</Text>
      )}
        {plotData && (
          <div className="relative flex-1 min-h-[1024px] w-full">
            <UMAPComparisonPlot data={plotData} />
          </div>
        )}
    </div>
  );
};

export default VisPanel;
