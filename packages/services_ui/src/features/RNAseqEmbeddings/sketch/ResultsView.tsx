import { Progress, SimpleGrid, Stack, Table, Text } from '@mantine/core';
import { formatBytes } from './format';
import type { RunResult } from './types';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Text fz={28} fw={600} lh={1.2}>
        {value}
      </Text>
    </div>
  );
}

/**
 * Placeholder visualization. Replace the body with your real charts/viewers;
 * the page only needs a component that takes a RunResult.
 */
export function ResultsView({ result }: { result: RunResult }) {
  const top = result.byExtension.slice(0, 10);
  const maxBytes = Math.max(...top.map((e) => e.bytes), 1);

  return (
    <Stack gap="xl">
      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <Stat label="Files" value={result.entryCount.toLocaleString()} />
        <Stat label="Total size" value={formatBytes(result.totalBytes)} />
        <Stat label="File types" value={result.byExtension.length.toLocaleString()} />
      </SimpleGrid>

      <div>
        <Text fw={600} mb="xs">
          Size by file type
        </Text>
        <Stack gap={8}>
          {top.map((e) => (
            <div key={e.extension} className="grid grid-cols-[5rem_1fr_9rem] items-center gap-3">
              <Text size="sm" ff="monospace" truncate>
                {e.extension}
              </Text>
              <Progress value={(e.bytes / maxBytes) * 100} size="lg" radius="sm" aria-label={`${e.extension} size`} />
              <Text size="sm" c="dimmed" ta="right">
                {e.count.toLocaleString()} · {formatBytes(e.bytes)}
              </Text>
            </div>
          ))}
        </Stack>
      </div>

      <div>
        <Text fw={600} mb="xs">
          Largest files
        </Text>
        <Table.ScrollContainer minWidth={320}>
          <Table verticalSpacing="xs" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Path</Table.Th>
                <Table.Th ta="right">Size</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {result.largest.map((f) => (
                <Table.Tr key={f.path}>
                  <Table.Td className="break-all">{f.path}</Table.Td>
                  <Table.Td ta="right" className="whitespace-nowrap">
                    {formatBytes(f.bytes)}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </div>
    </Stack>
  );
}
