'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import { Clock, Plus, Trash2, Key } from 'lucide-react';
import type { HeartbeatRecord } from '@jobwhistle/contracts';

export default function HeartbeatsListPage() {
  const [heartbeats, setHeartbeats] = React.useState<HeartbeatRecord[]>([]);

  const fetchHeartbeats = async () => {
    const res = await apiRequest<HeartbeatRecord[]>('/api/v1/heartbeats');
    if (res.success && res.data) {
      setHeartbeats(res.data);
    }
  };

  React.useEffect(() => {
    fetchHeartbeats();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this heartbeat monitor?')) return;
    await apiRequest(`/api/v1/heartbeats/${id}`, { method: 'DELETE' });
    setHeartbeats(heartbeats.filter((h) => h.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Cron & Scheduled-Job Heartbeats
          </h1>
          <p className="text-xs text-[#A0ADA7] mt-1">
            Listen for periodic check-in pings from your cron jobs, backups, and background workers.
          </p>
        </div>

        <Link href="/app/heartbeats/new">
          <Button variant="lime" size="sm" className="gap-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Heartbeat</span>
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {heartbeats.length > 0 ? (
          heartbeats.map((hb) => (
            <Card
              key={hb.id}
              className="p-5 hover:border-[#347D72] transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/app/heartbeats/${hb.id}`}
                      className="font-bold text-base text-white hover:text-[#C8F169] truncate"
                    >
                      {hb.name}
                    </Link>
                    <StatusBadge status={hb.status} />
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#A0ADA7]">
                    <span className="flex items-center gap-1">
                      <Key className="w-3 h-3 text-[#C8F169]" />
                      <span>{hb.tokenPreview}</span>
                    </span>
                    <span>&bull;</span>
                    <span>Expected every {hb.expectedIntervalMinutes}m</span>
                    <span>&bull;</span>
                    <span>Grace: {hb.gracePeriodMinutes}m</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs font-mono shrink-0">
                  <div>
                    <div className="text-[#A0ADA7]">Last Check-in</div>
                    <div className="font-semibold text-white">
                      {formatDate(hb.lastCheckInAt)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#A0ADA7]">Deadline</div>
                    <div className="text-[#A0ADA7]">{formatDate(hb.deadlineAt)}</div>
                  </div>

                  <div className="flex items-center gap-2 pl-4 border-l border-[#2C3936]">
                    <Link href={`/app/heartbeats/${hb.id}`}>
                      <Button variant="outline" size="sm" className="text-xs h-8 px-3">
                        View Code
                      </Button>
                    </Link>
                    <button
                      onClick={(e) => handleDelete(hb.id, e)}
                      className="p-1.5 text-[#A0ADA7] hover:text-[#D45252] rounded hover:bg-[#1C2928] transition-colors"
                      title="Delete Heartbeat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center space-y-4">
            <Clock className="w-10 h-10 text-[#687670] mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No heartbeats listening</h3>
              <p className="text-xs text-[#A0ADA7]">
                Create a heartbeat to start tracking your cron jobs, database backups, and scheduled scripts.
              </p>
            </div>
            <Link href="/app/heartbeats/new">
              <Button variant="lime" size="sm">
                Add Heartbeat
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
