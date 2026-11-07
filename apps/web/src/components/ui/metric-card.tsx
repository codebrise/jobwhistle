import * as React from 'react';
import { Card } from './card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  label,
  value,
  subtext,
  trend = 'neutral',
  icon,
  className,
}: MetricCardProps) {
  const trendColors = {
    positive: 'text-[#19875D]',
    negative: 'text-[#D45252]',
    neutral: 'text-[#A0ADA7]',
  };

  return (
    <Card className={cn('p-5 flex flex-col justify-between', className)}>
      <div className="flex items-center justify-between text-[#A0ADA7] text-xs font-medium uppercase tracking-wider">
        <span>{label}</span>
        {icon && <div className="text-[#C8F169] opacity-80">{icon}</div>}
      </div>
      <div className="mt-3">
        <div className="text-2xl lg:text-3xl font-bold tracking-tight text-white tabular-nums">
          {value}
        </div>
        {subtext && (
          <p className={cn('text-xs mt-1 font-medium', trendColors[trend])}>
            {subtext}
          </p>
        )}
      </div>
    </Card>
  );
}
