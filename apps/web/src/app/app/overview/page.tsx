'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { MetricCard } from '@/components/ui/metric-card';
import { StatusBadge } from '@/components/ui/badge';
import { UptimeBar } from '@/components/ui/uptime-bar';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/api-client';
import { formatMs, formatDate } from '@/lib/utils';
import {
  Activity,
  Clock,
  AlertTriangle,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import type { OverviewMetrics, MonitorWithStats, HeartbeatRecord, IncidentRecord } from '@jobwhistle/contracts';

export default function OverviewPage() {
  const [data, setData] = React.useState<{
    metrics: OverviewMetrics;
    monitors: MonitorWithStats[];
    heartbeats: HeartbeatRecord[];
    recentIncidents: IncidentRecord[];
  } | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchOverview = async () => {
    setLoading(true);
    const res = await apiRequest<{
      metrics: OverviewMetrics;
      monitors: MonitorWithStats[];
      heartbeats: HeartbeatRecord[];
      recentIncidents: IncidentRecord[];
    }>('/api/v1/overview');

    if (res.success && res.data) {
      setData(res.data);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    fetchOverview();
  }, []);

  const metrics = data?.metrics || {
    totalMonitors: 0,
    upMonitors: 0,
    downMonitors: 0,
    pausedMonitors: 0,
    totalHeartbeats: 0,
    healthyHeartbeats: 0,
    missedHeartbeats: 0,
    openIncidents: 0,
    uptimePercentage24h: 100.0,
    avgResponseTimeMs: 0,
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Overview</h1>
          <p className="text-xs text-[#A0ADA7] mt-1">
            Real-time status of your websites, APIs, and scheduled background jobs.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOverview}
            disabled={loading}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Link href="/app/monitors/new">
            <Button variant="lime" size="sm" className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Monitor</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="HTTP Monitors"
          value={`${metrics.upMonitors} / ${metrics.totalMonitors}`}
          subtext={
            metrics.downMonitors > 0
              ? `${metrics.downMonitors} service(s) down`
              : 'All endpoints healthy'
          }
          trend={metrics.downMonitors > 0 ? 'negative' : 'positive'}
          icon={<Activity className="w-5 h-5" />}
        />
        <MetricCard
          label="Cron Heartbeats"
          value={`${metrics.healthyHeartbeats} / ${metrics.totalHeartbeats}`}
          subtext={
            metrics.missedHeartbeats > 0
              ? `${metrics.missedHeartbeats} missed deadline`
              : 'All schedules on time'
          }
          trend={metrics.missedHeartbeats > 0 ? 'negative' : 'positive'}
          icon={<Clock className="w-5 h-5" />}
        />
        <MetricCard
          label="24h Availability"
          value={`${metrics.uptimePercentage24h.toFixed(1)}%`}
          subtext="Deterministic probe aggregate"
          trend="positive"
          icon={<ShieldCheck className="w-5 h-5" />}
        />
        <MetricCard
          label="P95 Response Time"
          value={formatMs(metrics.avgResponseTimeMs)}
          subtext="Edge-to-origin latency"
          trend="neutral"
          icon={<Activity className="w-5 h-5" />}
        />
      </div>

      {/* Active Incidents Banner or Calm Zero State */}
      {metrics.openIncidents > 0 ? (
        <div className="rounded-xl border border-[#D45252]/40 bg-[#D45252]/10 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-[#D45252] shrink-0" />
            <div>
              <div className="text-sm font-bold text-white">
                {metrics.openIncidents} Active Incident(s) Detected
              </div>
              <p className="text-xs text-[#EAF0EC]/80 mt-0.5">
                Service disruption confirmed across consecutive probe checks.
              </p>
            </div>
          </div>
          <Link href="/app/incidents">
            <Button variant="danger" size="sm">
              View Incident Timeline
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-[#2C3936] bg-[#131E1E] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#19875D]/15 border border-[#19875D]/30 flex items-center justify-center text-[#19875D]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">All Monitored Services Operational</div>
              <p className="text-[11px] text-[#A0ADA7]">Zero active incidents. Last probe cycle executed on schedule.</p>
            </div>
          </div>
          <span className="text-xs font-mono text-[#19875D] font-semibold hidden sm:inline">
            Status: Quiet & Calm
          </span>
        </div>
      )}

      {/* Two Column Layout: Monitors & Heartbeats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Monitors Column */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#C8F169]" />
              <h2 className="text-base font-bold text-white">HTTP & HTTPS Monitors</h2>
            </div>
            <Link
              href="/app/monitors"
              className="text-xs text-[#A0ADA7] hover:text-[#C8F169] flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {data?.monitors && data.monitors.length > 0 ? (
              data.monitors.map((mon) => (
                <Card key={mon.id} className="p-4 hover:border-[#347D72] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <Link
                          href={`/app/monitors/${mon.id}`}
                          className="font-bold text-sm text-white hover:text-[#C8F169]"
                        >
                          {mon.name}
                        </Link>
                        <StatusBadge status={mon.status} />
                      </div>
                      <div className="text-xs font-mono text-[#A0ADA7] truncate max-w-md">
                        {mon.url}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-right shrink-0">
                      <div>
                        <div className="text-[#A0ADA7]">Latency</div>
                        <div className="font-semibold text-white">
                          {formatMs(mon.avgResponseTimeMs)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[#A0ADA7]">Last Check</div>
                        <div className="text-[#A0ADA7]">{formatDate(mon.lastCheckedAt)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#2C3936]/60">
                    <UptimeBar
                      uptimePercentage={mon.uptimePercentage24h}
                      recentChecks={mon.recentChecks}
                    />
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center space-y-3">
                <p className="text-sm text-[#A0ADA7]">No HTTP monitors configured yet.</p>
                <Link href="/app/monitors/new">
                  <Button variant="lime" size="sm">
                    Create First Monitor
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        </div>

        {/* Heartbeats Column */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C8F169]" />
              <h2 className="text-base font-bold text-white">Cron Heartbeats</h2>
            </div>
            <Link
              href="/app/heartbeats"
              className="text-xs text-[#A0ADA7] hover:text-[#C8F169] flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {data?.heartbeats && data.heartbeats.length > 0 ? (
              data.heartbeats.map((hb) => (
                <Card key={hb.id} className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/app/heartbeats/${hb.id}`}
                      className="font-bold text-sm text-white hover:text-[#C8F169]"
                    >
                      {hb.name}
                    </Link>
                    <StatusBadge status={hb.status} />
                  </div>
                  <div className="text-xs text-[#A0ADA7] space-y-1">
                    <div className="flex justify-between">
                      <span>Expected:</span>
                      <span className="font-mono text-white">Every {hb.expectedIntervalMinutes}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Check-in:</span>
                      <span className="font-mono text-white">{formatDate(hb.lastCheckInAt)}</span>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-6 text-center space-y-3">
                <p className="text-xs text-[#A0ADA7]">No cron heartbeats listening.</p>
                <Link href="/app/heartbeats/new">
                  <Button variant="outline" size="sm">
                    Add Heartbeat
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
