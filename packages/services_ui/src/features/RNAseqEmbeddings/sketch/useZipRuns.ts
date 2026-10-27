import { useCallback, useEffect, useRef } from 'react';
import { useLocalStorage } from '@mantine/hooks';
import { processFile } from '../processFile';
import type { ProcessZip, Run } from './types';

const STORAGE_KEY = 'zip-runs';

/**
 * Owns run history + the lifecycle of the active run.
 * History (metadata + results, not the zip itself) persists in localStorage.
 * Swap useLocalStorage for an API call if history should live server-side.
 */
export function useZipRuns(processZip: ProcessZip = processFile) {
  const [runs, setRuns] = useLocalStorage<Run[]>({
    key: STORAGE_KEY,
    defaultValue: [],
    getInitialValueInEffect: false,
  });
  const controllers = useRef(new Map<string, AbortController>());

  // A run that was "running" when the page closed can never finish.
  useEffect(() => {
    setRuns((rs) =>
      rs.map((r) =>
        r.status === 'running'
          ? { ...r, status: 'failed', error: 'Processing was interrupted when the page closed.' }
          : r
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patch = useCallback(
    (id: string, changes: Partial<Run>) =>
      setRuns((rs) => rs.map((r) => (r.id === id ? { ...r, ...changes } : r))),
    [setRuns]
  );

  /** Starts processing and returns the new run's id immediately. */
  const start = useCallback(
    (file: File): string => {
      const id = crypto.randomUUID();
      const controller = new AbortController();
      controllers.current.set(id, controller);

      setRuns((rs) => [
        {
          id,
          fileName: file.name,
          fileSize: file.size,
          startedAt: Date.now(),
          status: 'running',
          progress: 0,
          stageLabel: 'Starting',
        },
        ...rs,
      ]);

      void (async () => {
        try {
          const result = await processZip(file, {
            signal: controller.signal,
            onProgress: (progress, stageLabel) => patch(id, { progress, stageLabel }),
          });
          patch(id, { status: 'complete', progress: 100, stageLabel: 'Done', finishedAt: Date.now(), result });
        } catch (err) {
          if (controller.signal.aborted) {
            patch(id, { status: 'cancelled', stageLabel: 'Cancelled', finishedAt: Date.now() });
          } else {
            patch(id, {
              status: 'failed',
              finishedAt: Date.now(),
              error: err instanceof Error ? err.message : 'Something went wrong while processing.',
            });
          }
        } finally {
          controllers.current.delete(id);
        }
      })();

      return id;
    },
    [patch, processZip, setRuns]
  );

  const cancel = useCallback((id: string) => controllers.current.get(id)?.abort(), []);

  const remove = useCallback(
    (id: string) => {
      controllers.current.get(id)?.abort();
      setRuns((rs) => rs.filter((r) => r.id !== id));
    },
    [setRuns]
  );

  const clearFinished = useCallback(
    () => setRuns((rs) => rs.filter((r) => r.status === 'running')),
    [setRuns]
  );

  return { runs, start, cancel, remove, clearFinished };
}
