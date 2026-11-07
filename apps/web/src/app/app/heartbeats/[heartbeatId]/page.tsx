'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { CodeBlock } from '@/components/ui/code-block';
import { apiRequest } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  RefreshCw,
  Key,
  CheckCircle2,
  Pause,
  Play,
  Trash2,
} from 'lucide-react';
import type { HeartbeatWithDetails } from '@jobwhistle/contracts';

export default function HeartbeatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const heartbeatId = params.heartbeatId as string;
  const [heartbeat, setHeartbeat] = React.useState<HeartbeatWithDetails | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [rotatedToken, setRotatedToken] = React.useState<string | null>(null);
  const [rotating, setRotating] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState(false);

  const fetchDetail = React.useCallback(async () => {
    setLoading(true);
    const res = await apiRequest<HeartbeatWithDetails>(`/api/v1/heartbeats/${heartbeatId}`);
    if (res.success && res.data) {
      setHeartbeat(res.data);
    }
    setLoading(false);
  }, [heartbeatId]);

  React.useEffect(() => {
    if (heartbeatId) {
      fetchDetail();
    }
  }, [heartbeatId, fetchDetail]);

  const handleRotateToken = async () => {
    if (
      !confirm(
        'Are you sure you want to rotate this token? Any script using the old check-in token will stop working immediately.'
      )
    ) {
      return;
    }

    setRotating(true);
    const res = await apiRequest<{ token: string; checkInUrl: string }>(
      `/api/v1/heartbeats/${heartbeatId}/rotate-token`,
      { method: 'POST' }
    );

    if (res.success && res.data) {
      setRotatedToken(res.data.checkInUrl);
      await fetchDetail();
    }
    setRotating(false);
  };

  const handleTogglePause = async () => {
    if (!heartbeat) return;
    setActionLoading(true);
    const action = heartbeat.active ? 'pause' : 'resume';
    await apiRequest(`/api/v1/heartbeats/${heartbeatId}/${action}`, { method: 'POST' });
    await fetchDetail();
    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this heartbeat monitor? All check-in history and incident logs will be permanently deleted.'
      )
    ) {
      return;
    }
    setActionLoading(true);
    const res = await apiRequest(`/api/v1/heartbeats/${heartbeatId}`, { method: 'DELETE' });
    if (res.success) {
      router.push('/app/heartbeats');
    } else {
      alert(res.error?.message || 'Failed to delete heartbeat.');
      setActionLoading(false);
    }
  };

  if (loading && !heartbeat) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-sm text-[#A0ADA7]">
          <RefreshCw className="w-4 h-4 animate-spin text-[#C8F169]" />
          <span>Loading heartbeat data...</span>
        </div>
      </div>
    );
  }

  if (!heartbeat) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-white">Heartbeat not found</h2>
        <Link href="/app/heartbeats">
          <Button variant="outline" size="sm">
            &larr; Back to Heartbeats
          </Button>
        </Link>
      </div>
    );
  }

  const defaultSnippets = {
    curl: `curl -fsS -m 10 --retry 3 "${heartbeat.checkInUrl || 'https://api.jobwhistle.codebrise.com/api/v1/heartbeats/check-in/<TOKEN>'}"`,
    bash: `#!/usr/bin/env bash\n# Run scheduled job\n/path/to/backup.sh && curl -fsS -m 10 "${heartbeat.checkInUrl || 'https://api.jobwhistle.codebrise.com/api/v1/heartbeats/check-in/<TOKEN>'}"`,
    node: `// Node.js (fetch)\nawait fetch("${heartbeat.checkInUrl || 'https://api.jobwhistle.codebrise.com/api/v1/heartbeats/check-in/<TOKEN>'}");`,
    python: `import urllib.request\ntry:\n    urllib.request.urlopen("${heartbeat.checkInUrl || 'https://api.jobwhistle.codebrise.com/api/v1/heartbeats/check-in/<TOKEN>'}", timeout=10)\nexcept Exception as e:\n    print(f"Check-in failed: {e}")`,
    php: `<?php\nfile_get_contents("${heartbeat.checkInUrl || 'https://api.jobwhistle.codebrise.com/api/v1/heartbeats/check-in/<TOKEN>'}");\n?>`,
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/app/heartbeats">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {heartbeat.name}
              </h1>
              <StatusBadge status={heartbeat.status} />
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#A0ADA7] mt-0.5">
              <span className="flex items-center gap-1">
                <Key className="w-3 h-3 text-[#C8F169]" />
                <span>{heartbeat.tokenPreview}</span>
              </span>
              <span>&bull;</span>
              <span>Expected every {heartbeat.expectedIntervalMinutes}m</span>
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
            {heartbeat.active ? (
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
            variant="outline"
            size="sm"
            onClick={handleRotateToken}
            disabled={rotating || actionLoading}
            className="text-xs text-[#A0ADA7] hover:text-white"
          >
            Rotate Token
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={actionLoading}
            className="gap-1 text-xs text-[#A0ADA7] hover:text-[#D45252] p-2"
            title="Delete Heartbeat"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {rotatedToken && (
        <div className="rounded-xl border border-[#C8F169]/40 bg-[#131E1E] p-5 space-y-3">
          <div className="flex items-center gap-2 text-[#C8F169] text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>New Check-in URL Generated</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={rotatedToken}
              className="flex-1 font-mono text-xs bg-[#0D1515] text-[#C8F169] px-3 py-2 rounded border border-[#2C3936]"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigator.clipboard.writeText(rotatedToken)}
            >
              Copy
            </Button>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-xs text-[#A0ADA7] uppercase tracking-wider">Expected Interval</div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums">
            {heartbeat.expectedIntervalMinutes}m
          </div>
          <div className="text-[11px] text-[#A0ADA7] mt-0.5">Scheduled frequency</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-[#A0ADA7] uppercase tracking-wider">Grace Period</div>
          <div className="text-2xl font-bold text-white mt-1 tabular-nums">
            {heartbeat.gracePeriodMinutes}m
          </div>
          <div className="text-[11px] text-[#A0ADA7] mt-0.5">Buffer before incident</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-[#A0ADA7] uppercase tracking-wider">Last Check-in</div>
          <div className="text-sm font-bold text-white mt-2 truncate">
            {formatDate(heartbeat.lastCheckInAt)}
          </div>
          <div className="text-[11px] text-[#19875D] mt-0.5">Registered ping</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-[#A0ADA7] uppercase tracking-wider">Next Deadline</div>
          <div className="text-sm font-bold text-white mt-2 truncate">
            {formatDate(heartbeat.deadlineAt)}
          </div>
          <div className="text-[11px] text-[#A0ADA7] mt-0.5">Alerts if missed</div>
        </Card>
      </div>

      {/* Integration Code Snippets */}
      <Card className="p-6 space-y-3">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Integration Snippets</h3>
          <p className="text-xs text-[#A0ADA7]">
            Paste this one-liner at the conclusion of your scheduled job or backup script.
          </p>
        </div>
        <CodeBlock snippets={defaultSnippets} />
      </Card>

      {/* Recent Check-ins Table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2C3936] bg-[#142522]">
          <h3 className="text-base font-bold text-white">Recent Ping Check-ins</h3>
          <p className="text-xs text-[#A0ADA7]">
            Log of incoming pings received by the Jobwhistle public check-in gateway.
          </p>
        </div>

        <div className="divide-y divide-[#2C3936]/60">
          {heartbeat.recentCheckIns && heartbeat.recentCheckIns.length > 0 ? (
            heartbeat.recentCheckIns.map((ci) => (
              <div
                key={ci.id}
                className="px-6 py-3.5 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#19875D]" />
                  <span className="font-bold text-white">Ping Received (HTTP 200 OK)</span>
                  {ci.userAgent && (
                    <span className="text-[#687670] truncate max-w-xs hidden md:inline">
                      {ci.userAgent}
                    </span>
                  )}
                </div>
                <div className="text-[#A0ADA7]">{formatDate(ci.receivedAt)}</div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-[#687670]">
              No pings received yet. Send a test curl request to the check-in URL!
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
