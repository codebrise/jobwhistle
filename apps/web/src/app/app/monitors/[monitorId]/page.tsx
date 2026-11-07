'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/api-client';
import { formatMs, formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  Play,
  Pause,
  Trash2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import type { MonitorWithStats } from '@jobwhistle/contracts';

export default function MonitorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const monitorId = params.monitorId as string;
  const [monitor, setMonitor] = React.useState<MonitorWithStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [checking, setChecking] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState(false);

  const fetchDetail = React.useCallback(async () => {
    setLoading(true);
    const res = await apiRequest<MonitorWithStats>(`/api/v1/monitors/${monitorId}`);
    if (res.success && res.data) {
      setMonitor(res.data);
    }
    setLoading(false);
  }, [monitorId]);

  React.useEffect(() => {
    if (monitorId) {
      fetchDetail();
    }
  }, [monitorId, fetchDetail]);

  const handleCheckNow = async () => {
    setChecking(true);
    await apiRequest(`/api/v1/monitors/${monitorId}/check-now`, { method: 'POST' });
    await fetchDetail();
    setChecking(false);
  };

  const handleTogglePause = async () => {
    if (!monitor) return;
    setActionLoading(true);
    const action = monitor.active ? 'pause' : 'resume';
    await apiRequest(`/api/v1/monitors/${monitorId}/${action}`, { method: 'POST' });
    await fetchDetail();
    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this monitor? All check telemetry and incident logs will be permanently deleted.'
      )
    ) {
      return;
    }
    setActionLoading(true);
    const res = await apiRequest(`/api/v1/monitors/${monitorId}`, { method: 'DELETE' });
    if (res.success) {
      router.push('/app/monitors');
    } else {
      alert(res.error?.message || 'Failed to delete monitor.');
      setActionLoading(false);
    }
  };

  // Prepare chart data
  const chartData = React.useMemo(() => {
    if (!monitor?.recentChecks) return [];
    return [...monitor.recentChecks]
      .reverse()
      .map((chk, i) => ({
        index: i + 1,
        time: new Date(chk.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        latency: chk.responseTimeMs,
        isUp: chk.isUp,
        status: chk.statusCode || 'Err',
      }));
  }, [monitor]);

  if (loading && !monitor) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-sm text-[#A0ADA7]">
          <RefreshCw className="w-4 h-4 animate-spin text-[#C8F169]" />
          <span>Loading monitor telemetry...</span>
        </div>
      </div>
    );
  }

  if (!monitor) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-white">Monitor not found</h2>
        <Link href="/app/monitors">
          <Button variant="outline" size="sm">
            &larr; Back to Monitors
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/app/monitors">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {monitor.name}
              </h1>
              <StatusBadge status={monitor.status} />
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#A0ADA7] mt-0.5">
              <span>{monitor.method}</span>
              <span>&bull;</span>
              <a
                href={monitor.url}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white flex items-center gap-1"
              >
                <span>{monitor.url}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTogglePause}
            disabled={actionLoading}
            className="gap-1.5 text-xs text-[#A0ADA7] hover:text-white"
          >
            {monitor.active ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-[#C8F169]" />
                <span>Resume</span>
              </>
            )}
          </Button>

          <Button
            variant="lime"
            size="sm"
            onClick={handleCheckNow}
            disabled={checking || actionLoading}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Probing...' : 'Check Now'}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={actionLoading}
            className="gap-1 text-xs text-[#A0ADA7] hover:text-[#D45252] p-2"
            title="Delete Monitor"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs text-[#A0ADA7] uppercase tracking-wider">24h Uptime</div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums">
            {(monitor.uptimePercentage24h ?? 100.0).toFixed(1)}%
          </div>
          <div className="text-[11px] text-[#19875D] mt-0.5">Deterministic</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-[#A0ADA7] uppercase tracking-wider">7d Uptime</div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums">
            {(monitor.uptimePercentage7d ?? 100.0).toFixed(1)}%
          </div>
          <div className="text-[11px] text-[#A0ADA7] mt-0.5">Rolling Window</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-[#A0ADA7] uppercase tracking-wider">Avg Latency</div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums">
            {formatMs(monitor.avgResponseTimeMs || 0)}
          </div>
          <div className="text-[11px] text-[#A0ADA7] mt-0.5">Edge Roundtrip</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-[#A0ADA7] uppercase tracking-wider">Consecutive Fails</div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums">
            {monitor.consecutiveFailures || 0}
          </div>
          <div className="text-[11px] text-[#A0ADA7] mt-0.5">Threshold: 2 checks</div>
        </Card>
      </div>

      {/* Response Time Chart (Recharts) */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Roundtrip Latency History</h3>
            <p className="text-xs text-[#A0ADA7]">
              Probe response duration in milliseconds across recent scheduled executions.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#C8F169]">
            <span className="w-2 h-2 rounded-full bg-[#C8F169]" />
            <span>Response Duration (ms)</span>
          </div>
        </div>

        <div className="h-64 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8F169" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C8F169" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#687670" fontSize={11} tickLine={false} />
                <YAxis stroke="#687670" fontSize={11} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-[#2C3936] bg-[#0D1515] p-2.5 text-xs space-y-1 shadow-lg">
                          <div className="text-[#A0ADA7]">{data.time}</div>
                          <div className="font-bold text-white font-mono">
                            Latency: {data.latency}ms
                          </div>
                          <div className="text-[11px] text-[#C8F169] font-mono">
                            HTTP Status: {data.status}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="latency"
                  stroke="#C8F169"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#latencyGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-[#687670]">
              Insufficient check history to render latency graph.
            </div>
          )}
        </div>
      </Card>

      {/* Check History Table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2C3936] bg-[#142522]">
          <h3 className="text-base font-bold text-white">Recent Probe Checks</h3>
          <p className="text-xs text-[#A0ADA7]">
            Immutable telemetry log of individual probe execution results.
          </p>
        </div>

        <div className="divide-y divide-[#2C3936]/60">
          {monitor.recentChecks && monitor.recentChecks.length > 0 ? (
            monitor.recentChecks.map((chk) => (
              <div
                key={chk.id}
                className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      chk.isUp ? 'bg-[#19875D]' : 'bg-[#D45252]'
                    }`}
                  />
                  <span className="font-bold text-white">
                    {chk.statusCode ? `HTTP ${chk.statusCode}` : 'Network Failure'}
                  </span>
                  {chk.errorMessage && (
                    <span className="text-[#D45252] truncate max-w-xs">
                      {chk.errorMessage}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-6 text-[#A0ADA7]">
                  <span className="font-bold text-white">{chk.responseTimeMs}ms</span>
                  <span>{formatDate(chk.createdAt)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-[#687670]">
              No checks recorded yet.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
