import type { ReactNode } from 'react';
import { Text, ThemeIcon, Title } from '@mantine/core';
import { AlertTriangle, Check, Circle, CircleDot, Loader2 } from 'lucide-react';

export type StageState = 'idle' | 'ready' | 'active' | 'done' | 'error';

const ICONS: Record<StageState, { icon: ReactNode; color: string; variant: 'light' | 'filled' }> = {
  idle: { icon: <Circle size={14} />, color: 'gray', variant: 'light' },
  ready: { icon: <CircleDot size={14} />, color: 'blue', variant: 'light' },
  active: { icon: <Loader2 size={14} className="animate-spin" />, color: 'blue', variant: 'filled' },
  done: { icon: <Check size={14} />, color: 'teal', variant: 'filled' },
  error: { icon: <AlertTriangle size={14} />, color: 'red', variant: 'filled' },
};

interface StagePanelProps {
  title: string;
  /** One line shown beside the title that says where this stage stands. */
  status: string;
  state: StageState;
  isLast?: boolean;
  action?: ReactNode;
  children: ReactNode;
}

/**
 * One stage of the workflow. All stages are always on screen; the rail on the
 * left shows progress, but nothing here blocks navigation like a wizard would.
 */
export function StagePanel({ title, status, state, isLast, action, children }: StagePanelProps) {
  const { icon, color, variant } = ICONS[state];
  return (
    <section className="flex gap-4" aria-label={title}>
      <div className="flex flex-col items-center">
        <ThemeIcon radius="xl" size={28} color={color} variant={variant}>
          {icon}
        </ThemeIcon>
        {!isLast && <div className="my-1 w-px flex-1 bg-[var(--mantine-color-default-border)]" />}
      </div>

      <div className={`min-w-0 flex-1 ${isLast ? '' : 'pb-8'}`}>
        <div className="mb-3 flex min-h-[28px] flex-wrap items-center gap-x-3 gap-y-1">
          <Title order={4}>{title}</Title>
          <Text size="sm" c="dimmed">
            {status}
          </Text>
          <div className="ml-auto">{action}</div>
        </div>
        <div className={state === 'idle' ? 'opacity-60' : ''}>{children}</div>
      </div>
    </section>
  );
}
