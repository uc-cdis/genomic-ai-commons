import { useState } from 'react';
import { Alert, Button, Group, Paper, Progress, Text, Title } from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { FileArchive, Upload, X } from 'lucide-react';
import '@mantine/dropzone/styles.css';

import { formatBytes, formatDuration, formatStarted } from './format';
import { ResultsView } from './ResultsView';
import { RunHistory } from './RunHistory';
import { StagePanel, type StageState } from './StagePanel';
import { useZipRuns } from './useZipRuns';

const ZIP_TYPES = [MIME_TYPES.zip, 'application/x-zip-compressed'];

function FileCard({ name, size, detail }: { name: string; size: number; detail?: string }) {
  return (
    <Paper withBorder p="sm" radius="md">
      <Group gap="sm" wrap="nowrap">
        <FileArchive size={22} />
        <div className="min-w-0 flex-1">
          <Text fw={500} truncate>
            {name}
          </Text>
          <Text size="sm" c="dimmed">
            {formatBytes(size)}
            {detail ? ` · ${detail}` : ''}
          </Text>
        </div>
      </Group>
    </Paper>
  );
}

export function ZipRunPage() {
  const { runs, start, cancel, remove, clearFinished } = useZipRuns();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [staged, setStaged] = useState<File | null>(null);
  const [rejection, setRejection] = useState<string | null>(null);

  const run = runs.find((r) => r.id === selectedId) ?? null;

  const newRun = () => {
    setSelectedId(null);
    setStaged(null);
    setRejection(null);
  };

  const processStaged = () => {
    if (!staged) return;
    setSelectedId(start(staged));
    setStaged(null);
  };

  // Derive each stage's state from the one source of truth: the selected run (or the draft).
  const inputState: StageState = run ? 'done' : staged ? 'ready' : 'active';
  const processState: StageState = !run
    ? 'idle'
    : run.status === 'running'
      ? 'active'
      : run.status === 'complete'
        ? 'done'
        : 'error';
  const resultsState: StageState = run?.status === 'complete' ? 'done' : 'idle';

  return (
    <div className="grid h-full min-h-[600px] grid-cols-1 md:grid-cols-[18rem_1fr]">
      <aside className="border-b md:border-b-0 md:border-r border-[var(--mantine-color-default-border)]">
        <RunHistory
          runs={runs}
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedId(id);
            setStaged(null);
          }}
          onNewRun={newRun}
          onRemove={(id) => {
            remove(id);
            if (id === selectedId) newRun();
          }}
          onClearFinished={() => {
            clearFinished();
            if (run && run.status !== 'running') newRun();
          }}
        />
      </aside>

      <main className="min-w-0 overflow-y-auto p-6 lg:p-10">
        <div className="mx-auto max-w-4xl">
          <Title order={2} mb={4}>
            {run ? run.fileName : 'New run'}
          </Title>
          <Text c="dimmed" mb="xl">
            {run ? `Started ${formatStarted(run.startedAt)}` : 'Add a zip file, process it, then explore the results.'}
          </Text>

          <StagePanel
            title="Input"
            state={inputState}
            status={run ? 'File added' : staged ? 'Ready to process' : 'Waiting for a zip file'}
          >
            {run ? (
              <FileCard name={run.fileName} size={run.fileSize} />
            ) : staged ? (
              <Group align="stretch" wrap="wrap">
                <div className="min-w-[16rem] flex-1">
                  <FileCard name={staged.name} size={staged.size} />
                </div>
                <Button variant="default" onClick={() => setStaged(null)}>
                  Choose a different file
                </Button>
                <Button onClick={processStaged}>Process file</Button>
              </Group>
            ) : (
              <>
                <Dropzone
                  onDrop={(files) => {
                    setRejection(null);
                    setStaged(files[0]);
                  }}
                  onReject={() => setRejection('That file isn’t a .zip archive. Choose a file ending in .zip.')}
                  accept={ZIP_TYPES}
                  multiple={false}
                  radius="md"
                >
                  <Group justify="center" gap="md" mih={110} style={{ pointerEvents: 'none' }}>
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
                      <Text fw={500}>Drop a zip file here, or click to browse</Text>
                      <Text size="sm" c="dimmed">
                        One .zip archive per run
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
            )}
          </StagePanel>

          <StagePanel
            title="Process"
            state={processState}
            status={
              !run
                ? 'Starts when you process a file'
                : run.status === 'running'
                  ? run.stageLabel
                  : run.status === 'complete'
                    ? `Finished in ${formatDuration(run.startedAt, run.finishedAt)}`
                    : run.status === 'cancelled'
                      ? 'Cancelled'
                      : 'Failed'
            }
            action={
              run?.status === 'running' ? (
                <Button size="compact-sm" variant="default" onClick={() => cancel(run.id)}>
                  Cancel
                </Button>
              ) : undefined
            }
          >
            {run?.status === 'running' && (
              <Progress value={run.progress} animated size="lg" radius="sm" aria-label="Processing progress" />
            )}
            {run && (run.status === 'failed' || run.status === 'cancelled') && (
              <Alert color={run.status === 'failed' ? 'red' : 'gray'} title={run.status === 'failed' ? 'Processing failed' : 'Processing cancelled'}>
                <Text size="sm" mb="sm">
                  {run.error ?? 'Nothing was saved for this run. Start a new run to try again.'}
                </Text>
                <Button size="compact-sm" onClick={newRun}>
                  Start a new run
                </Button>
              </Alert>
            )}
            {run?.status === 'complete' && <Text size="sm">All files were processed.</Text>}
            {!run && <Text size="sm">Progress and any errors appear here.</Text>}
          </StagePanel>

          <StagePanel
            title="Results"
            state={resultsState}
            status={run?.status === 'complete' ? 'Ready to explore' : 'Available once processing finishes'}
            isLast
          >
            {run?.status === 'complete' && run.result ? (
              <ResultsView result={run.result} />
            ) : (
              <Text size="sm">Charts and tables for this run appear here.</Text>
            )}
          </StagePanel>
        </div>
      </main>
    </div>
  );
}

export default ZipRunPage;
