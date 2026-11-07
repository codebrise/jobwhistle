'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { CheckCircle2, RefreshCw, ArrowRight } from 'lucide-react';
import type { IncidentRecord } from '@jobwhistle/contracts';

export default function IncidentsListPage() {
  const [incidents, setIncidents] = React.useState<IncidentRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<'all' | 'open' | 'resolved'>('all');

  const fetchIncidents = async () => {
    setLoading(true);
    const res = await apiRequest<IncidentRecord[]>('/api/v1/incidents');
    if (res.success && res.data) {
      setIncidents(res.data);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    fetchIncidents();
  }, []);

  const filtered = incidents.filter((inc) => {
    if (filter === 'open') return inc.state === 'open' || inc.state === 'suspected';
    if (filter === 'resolved') return inc.state === 'resolved';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Incidents & Downtime</h1>
          <p className="text-xs text-[#A0ADA7] mt-1">
            Confirmed outages, missed heartbeat deadlines, and historical recovery timelines.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchIncidents}
          disabled={loading}
          className="gap-1.5 text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#2C3936] pb-3">
        {(['all', 'open', 'resolved'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              filter === tab
                ? 'bg-[#1C2928] text-[#C8F169] border border-[#2C3936]'
                : 'text-[#A0ADA7] hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((inc) => (
            <Card
              key={inc.id}
              className="p-5 hover:border-[#347D72] transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/app/incidents/${inc.id}`}
                      className="font-bold text-base text-white hover:text-[#C8F169] truncate"
                    >
                      {inc.targetName}
                    </Link>
                    <StatusBadge status={inc.state} />
                  </div>
                  <div className="text-xs text-[#D45252] font-mono leading-relaxed">
                    {inc.failureReason}
                  </div>
                  <div className="text-[11px] text-[#A0ADA7] font-mono">
                    Target: {inc.targetEndpoint}
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs font-mono shrink-0">
                  <div>
                    <div className="text-[#A0ADA7]">Detected</div>
                    <div className="font-semibold text-white">
                      {formatDate(inc.suspectedAt)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#A0ADA7]">Duration</div>
                    <div className="font-semibold text-[#C8F169]">
                      {inc.durationSeconds ? `${inc.durationSeconds}s` : 'Active / Ongoing'}
                    </div>
                  </div>

                  <Link href={`/app/incidents/${inc.id}`}>
                    <Button variant="outline" size="sm" className="text-xs h-8 gap-1">
                      <span>Timeline</span>
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center space-y-4">
            <CheckCircle2 className="w-10 h-10 text-[#19875D] mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No incidents in this view</h3>
              <p className="text-xs text-[#A0ADA7]">
                All monitored endpoints and heartbeat schedules are operating normally.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
