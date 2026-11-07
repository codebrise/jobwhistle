'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Bell,
  ShieldAlert,
} from 'lucide-react';
import type { IncidentWithDetails } from '@jobwhistle/contracts';

export default function IncidentDetailPage() {
  const params = useParams();
  const incidentId = params.incidentId as string;
  const [incident, setIncident] = React.useState<IncidentWithDetails | null>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchDetail = React.useCallback(async () => {
    setLoading(true);
    const res = await apiRequest<IncidentWithDetails>(`/api/v1/incidents/${incidentId}`);
    if (res.success && res.data) {
      setIncident(res.data);
    }
    setLoading(false);
  }, [incidentId]);

  React.useEffect(() => {
    if (incidentId) {
      fetchDetail();
    }
  }, [incidentId, fetchDetail]);

  if (loading && !incident) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-sm text-[#A0ADA7]">
          <RefreshCw className="w-4 h-4 animate-spin text-[#C8F169]" />
          <span>Loading incident timeline...</span>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-xl font-bold text-white">Incident not found</h2>
        <Link href="/app/incidents">
          <Button variant="outline" size="sm">
            &larr; Back to Incidents
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/app/incidents">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Incident: {incident.targetName}
              </h1>
              <StatusBadge status={incident.state} />
            </div>
            <div className="text-xs font-mono text-[#A0ADA7] mt-0.5">
              Target: {incident.targetEndpoint}
            </div>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={fetchDetail} className="text-xs gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-xs text-[#A0ADA7] uppercase tracking-wider">Detection Time</div>
          <div className="text-sm font-bold text-white mt-1">
            {formatDate(incident.suspectedAt)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-[#A0ADA7] uppercase tracking-wider">Recovery Time</div>
          <div className="text-sm font-bold text-white mt-1">
            {incident.resolvedAt ? formatDate(incident.resolvedAt) : 'Currently Unresolved'}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-[#A0ADA7] uppercase tracking-wider">Total Outage Duration</div>
          <div className="text-xl font-bold text-[#C8F169] mt-1 tabular-nums">
            {incident.durationSeconds ? `${incident.durationSeconds} seconds` : 'Ongoing'}
          </div>
        </Card>
      </div>

      {/* Incident Event Timeline */}
      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-base font-bold text-white">Chronological Event Timeline</h2>
          <p className="text-xs text-[#A0ADA7]">
            Recorded transitions across the probe engine and notification lifecycle.
          </p>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#2C3936]">
          {incident.timeline && incident.timeline.length > 0 ? (
            incident.timeline.map((event, idx) => {
              const iconMap = {
                suspected: <AlertTriangle className="w-3.5 h-3.5 text-[#C48A28]" />,
                confirmed: <ShieldAlert className="w-3.5 h-3.5 text-[#D45252]" />,
                notification_sent: <Bell className="w-3.5 h-3.5 text-[#C8F169]" />,
                resolved: <CheckCircle2 className="w-3.5 h-3.5 text-[#19875D]" />,
              };

              return (
                <div key={idx} className="relative flex items-start gap-4">
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-[#131E1E] border border-[#2C3936] flex items-center justify-center shrink-0">
                    {iconMap[event.event]}
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white capitalize">
                        {event.event.replace('_', ' ')}
                      </span>
                      <span className="font-mono text-[#687670]">{formatDate(event.timestamp)}</span>
                    </div>
                    <p className="text-xs text-[#A0ADA7] leading-relaxed">{event.message}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-xs text-[#687670]">Timeline recording initialized.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
