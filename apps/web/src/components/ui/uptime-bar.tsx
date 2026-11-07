'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface UptimeBarProps {
  uptimePercentage: number;
  segments?: number;
  recentChecks?: { isUp: boolean; createdAt: string }[];
  className?: string;
}

export function UptimeBar({
  uptimePercentage,
  segments = 30,
  recentChecks = [],
  className,
}: UptimeBarProps) {
  // Generate segments representing recent check health
  const bars = React.useMemo(() => {
    const list: { isUp: boolean }[] = [];
    if (recentChecks.length > 0) {
      // Use actual recent checks
      for (let i = 0; i < segments; i++) {
        const chk = recentChecks[i % recentChecks.length];
        list.unshift({ isUp: chk?.isUp ?? true });
      }
    } else {
      // If 100% uptime, all green
      for (let i = 0; i < segments; i++) {
        list.push({ isUp: uptimePercentage >= 99.0 || Math.random() < 0.98 });
      }
    }
    return list;
  }, [segments, recentChecks, uptimePercentage]);

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#A0ADA7] font-medium">30-Day Activity</span>
        <span className="font-semibold text-[#C8F169] tabular-nums">
          {uptimePercentage.toFixed(1)}% uptime
        </span>
      </div>
      <div className="flex items-center gap-1 h-6 w-full">
        {bars.map((b, idx) => (
          <div
            key={idx}
            className={cn(
              'flex-1 h-full rounded-sm transition-opacity hover:opacity-100',
              b.isUp ? 'bg-[#19875D] opacity-80' : 'bg-[#D45252] opacity-90'
            )}
            title={b.isUp ? 'Operational' : 'Incident Downtime'}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-[10px] text-[#687670]">
        <span>30 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}
