'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { UptimeBar } from '@/components/ui/uptime-bar';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/api-client';
import { formatMs, formatDate } from '@/lib/utils';
import {
  Activity,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  ExternalLink,
} from 'lucide-react';
import type { MonitorWithStats } from '@jobwhistle/contracts';

export default function MonitorsListPage() {
  const [monitors, setMonitors] = React.useState<MonitorWithStats[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [checkingId, setCheckingId] = React.useState<string | null>(null);

  const fetchMonitors = async () => {
    setLoading(true);
    const res = await apiRequest<MonitorWithStats[]>('/api/v1/monitors');
    if (res.success && res.data) {
      setMonitors(res.data);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    fetchMonitors();
  }, []);

  const handleCheckNow = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCheckingId(id);
    await apiRequest(`/api/v1/monitors/${id}/check-now`, { method: 'POST' });
    await fetchMonitors();
    setCheckingId(null);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this monitor?')) return;
    await apiRequest(`/api/v1/monitors/${id}`, { method: 'DELETE' });
    setMonitors(monitors.filter((m) => m.id !== id));
  };

  const filtered = monitors.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            HTTP & HTTPS Monitors
          </h1>
          <p className="text-xs text-[#A0ADA7] mt-1">
            Manage endpoints monitored from our edge dispatchers.
          </p>
        </div>

        <Link href="/app/monitors/new">
          <Button variant="lime" size="sm" className="gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>Create Monitor</span>
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#687670] absolute left-3 top-3" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by name or URL..."
            className="pl-9 h-10 text-xs"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchMonitors}
          disabled={loading}
          className="gap-1.5 text-xs h-10"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Monitors List */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((mon) => (
            <Card
              key={mon.id}
              className="p-5 hover:border-[#347D72] transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/app/monitors/${mon.id}`}
                      className="font-bold text-base text-white hover:text-[#C8F169] truncate"
                    >
                      {mon.name}
                    </Link>
                    <StatusBadge status={mon.status} />
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#A0ADA7] truncate">
                    <span>{mon.method}</span>
                    <span>&bull;</span>
                    <a
                      href={mon.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate hover:text-white flex items-center gap-1"
                    >
                      <span>{mon.url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs font-mono shrink-0">
                  <div>
                    <div className="text-[#A0ADA7]">Interval</div>
                    <div className="font-semibold text-white">{mon.intervalMinutes}m</div>
                  </div>
                  <div>
                    <div className="text-[#A0ADA7]">P95 Latency</div>
                    <div className="font-semibold text-white">
                      {formatMs(mon.avgResponseTimeMs)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#A0ADA7]">Last Check</div>
                    <div className="text-[#A0ADA7]">{formatDate(mon.lastCheckedAt)}</div>
                  </div>

                  <div className="flex items-center gap-2 pl-4 border-l border-[#2C3936]">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleCheckNow(mon.id, e)}
                      disabled={checkingId === mon.id}
                      className="text-xs h-8 px-2.5 gap-1"
                      title="Trigger probe check now"
                    >
                      <RefreshCw
                        className={`w-3 h-3 ${checkingId === mon.id ? 'animate-spin' : ''}`}
                      />
                      <span className="hidden sm:inline">Check Now</span>
                    </Button>
                    <button
                      onClick={(e) => handleDelete(mon.id, e)}
                      className="p-1.5 text-[#A0ADA7] hover:text-[#D45252] rounded hover:bg-[#1C2928] transition-colors"
                      title="Delete Monitor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
          <Card className="p-12 text-center space-y-4">
            <Activity className="w-10 h-10 text-[#687670] mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No monitors found</h3>
              <p className="text-xs text-[#A0ADA7]">
                {search ? 'Try clearing your search query.' : 'Add your first website or API endpoint to start monitoring.'}
              </p>
            </div>
            {!search && (
              <Link href="/app/monitors/new">
                <Button variant="lime" size="sm">
                  Create Monitor
                </Button>
              </Link>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
