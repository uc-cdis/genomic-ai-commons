import { ActionIcon, Button, NavLink, ScrollArea, Text, Tooltip } from '@mantine/core';
import { AlertTriangle, Ban, Check, Loader2, Plus, X } from 'lucide-react';
import { formatBytes, formatStarted } from './format';
import type { Run, RunStatus } from './types';

const STATUS_ICON: Record<RunStatus, React.ReactNode> = {
  running: <Loader2 size={16} className="animate-spin text-[var(--mantine-color-blue-6)]" />,
  complete: <Check size={16} className="text-[var(--mantine-color-teal-6)]" />,
  failed: <AlertTriangle size={16} className="text-[var(--mantine-color-red-6)]" />,
  cancelled: <Ban size={16} className="text-[var(--mantine-color-dimmed)]" />,
};

interface RunHistoryProps {
  runs: Run[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNewRun: () => void;
  onRemove: (id: string) => void;
  onClearFinished: () => void;
}

export function RunHistory({ runs, selectedId, onSelect, onNewRun, onRemove, onClearFinished }: RunHistoryProps) {
  const hasFinished = runs.some((r) => r.status !== 'running');

  return (
    <nav aria-label="Previous runs" className="flex h-full flex-col">
      <div className="p-3">
        <Button fullWidth leftSection={<Plus size={16} />} variant={selectedId === null ? 'light' : 'filled'} onClick={onNewRun}>
          New run
        </Button>
      </div>

      <div className="flex items-center justify-between px-4 pb-1">
        <Text size="sm" fw={600}>
          History
        </Text>
        {hasFinished && (
          <Button variant="subtle" size="compact-xs" color="gray" onClick={onClearFinished}>
            Clear
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1" px="xs">
        {runs.length === 0 ? (
          <Text size="sm" c="dimmed" px="xs" py="sm">
            Runs you process will show up here so you can open their results again.
          </Text>
        ) : (
          runs.map((run) => (
            <div key={run.id} className="group flex items-center gap-1">
              <NavLink
                className="min-w-0 flex-1 rounded-md"
                active={run.id === selectedId}
                onClick={() => onSelect(run.id)}
                leftSection={STATUS_ICON[run.status]}
                label={<span className="block truncate">{run.fileName}</span>}
                description={`${formatStarted(run.startedAt)} · ${formatBytes(run.fileSize)}`}
              />
              <Tooltip label="Remove from history" openDelay={400}>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  aria-label={`Remove ${run.fileName} from history`}
                  className="opacity-0 transition-opacity focus:opacity-100 group-hover:opacity-100"
                  onClick={() => onRemove(run.id)}
                >
                  <X size={14} />
                </ActionIcon>
              </Tooltip>
            </div>
          ))
        )}
      </ScrollArea>
    </nav>
  );
}
