import * as React from 'react';
import { cn } from '@/lib/utils';
import type { MonitorStatus } from '@jobwhistle/contracts';

interface StatusBadgeProps {
  status: MonitorStatus | 'resolved' | 'suspected' | 'open';
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({
  status,
  className,
  showDot = true,
}: StatusBadgeProps) {
  const configs: Record<
    string,
    { label: string; bg: string; text: string; dot: string; border: string }
  > = {
    up: {
      label: 'Operational',
      bg: 'bg-[#19875D]/15',
      text: 'text-[#19875D]',
      dot: 'bg-[#19875D]',
      border: 'border-[#19875D]/30',
    },
    resolved: {
      label: 'Resolved',
      bg: 'bg-[#19875D]/15',
      text: 'text-[#19875D]',
      dot: 'bg-[#19875D]',
      border: 'border-[#19875D]/30',
    },
    degraded: {
      label: 'Degraded',
      bg: 'bg-[#C48A28]/15',
      text: 'text-[#C48A28]',
      dot: 'bg-[#C48A28]',
      border: 'border-[#C48A28]/30',
    },
    suspected: {
      label: 'Suspected',
      bg: 'bg-[#C48A28]/15',
      text: 'text-[#C48A28]',
      dot: 'bg-[#C48A28]',
      border: 'border-[#C48A28]/30',
    },
    down: {
      label: 'Down',
      bg: 'bg-[#D45252]/15',
      text: 'text-[#D45252]',
      dot: 'bg-[#D45252]',
      border: 'border-[#D45252]/30',
    },
    open: {
      label: 'Active Incident',
      bg: 'bg-[#D45252]/15',
      text: 'text-[#D45252]',
      dot: 'bg-[#D45252]',
      border: 'border-[#D45252]/30',
    },
    paused: {
      label: 'Paused',
      bg: 'bg-[#74847D]/15',
      text: 'text-[#74847D]',
      dot: 'bg-[#74847D]',
      border: 'border-[#74847D]/30',
    },
    pending: {
      label: 'Pending',
      bg: 'bg-[#477DA8]/15',
      text: 'text-[#477DA8]',
      dot: 'bg-[#477DA8]',
      border: 'border-[#477DA8]/30',
    },
  };

  const current = configs[status] || configs.pending;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        current.bg,
        current.text,
        current.border,
        className
      )}
    >
      {showDot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full animate-pulse', current.dot)}
        />
      )}
      <span>{current.label}</span>
    </span>
  );
}
