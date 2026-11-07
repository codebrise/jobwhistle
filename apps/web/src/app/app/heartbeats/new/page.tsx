'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CodeBlock } from '@/components/ui/code-block';
import { apiRequest } from '@/lib/api-client';
import { ArrowLeft, CheckCircle2, AlertCircle, Copy } from 'lucide-react';

export default function NewHeartbeatPage() {
  const [name, setName] = React.useState('');
  const [expectedIntervalMinutes, setExpectedIntervalMinutes] = React.useState(60);
  const [gracePeriodMinutes, setGracePeriodMinutes] = React.useState(15);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [createdData, setCreatedData] = React.useState<{
    id: string;
    token: string;
    checkInUrl: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiRequest<{ id: string; token: string; checkInUrl: string }>(
        '/api/v1/heartbeats',
        {
          method: 'POST',
          body: JSON.stringify({
            name,
            expectedIntervalMinutes,
            gracePeriodMinutes,
            active: true,
          }),
        }
      );

      if (res.success && res.data) {
        setCreatedData(res.data);
      } else {
        setError(res.error?.message || 'Failed to create heartbeat.');
      }
    } catch {
      setError('An error occurred during heartbeat creation.');
    } finally {
      setLoading(false);
    }
  };

  const snippets: Record<string, string> = React.useMemo(() => {
    if (!createdData) {
      return {} as Record<string, string>;
    }
    const url = createdData.checkInUrl;
    return {
      curl: `curl -fsS -m 10 --retry 3 "${url}"`,
      bash: `#!/usr/bin/env bash\n# Run your job\n/path/to/my-script.sh && curl -fsS -m 10 "${url}"`,
      node: `// Node.js (native fetch)\nawait fetch("${url}");`,
      python: `import urllib.request\ntry:\n    urllib.request.urlopen("${url}", timeout=10)\nexcept Exception as e:\n    print(f"Check-in failed: {e}")`,
      php: `<?php\nfile_get_contents("${url}");\n?>`,
    };
  }, [createdData]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/app/heartbeats">
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Create Cron Heartbeat
          </h1>
          <p className="text-xs text-[#A0ADA7] mt-0.5">
            Get a unique ping endpoint for scheduled background jobs.
          </p>
        </div>
      </div>

      {!createdData ? (
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-[#D45252]/10 border border-[#D45252]/30 text-xs text-[#D45252]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#A0ADA7]">
                Heartbeat Name
              </label>
              <Input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Daily Postgres Backup or Nightly Stripe Sync"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#A0ADA7]">
                  Expected Interval
                </label>
                <select
                  value={expectedIntervalMinutes}
                  onChange={(e) => setExpectedIntervalMinutes(Number(e.target.value))}
                  className="flex h-10 w-full rounded-lg border border-[#2C3936] bg-[#0D1515] px-3 py-2 text-sm text-[#EAF0EC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8F169]"
                >
                  <option value={15}>Every 15 minutes</option>
                  <option value={30}>Every 30 minutes</option>
                  <option value={60}>Every 1 hour (Default)</option>
                  <option value={360}>Every 6 hours</option>
                  <option value={720}>Every 12 hours</option>
                  <option value={1440}>Every 24 hours (Daily)</option>
                  <option value={10080}>Every 7 days (Weekly)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#A0ADA7]">
                  Grace Period (Minutes)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={1440}
                  value={gracePeriodMinutes}
                  onChange={(e) => setGracePeriodMinutes(Number(e.target.value))}
                />
                <p className="text-[11px] text-[#687670]">
                  Buffer time allowed after interval passes before raising an incident.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#2C3936] flex items-center justify-between">
              <Link href="/app/heartbeats">
                <Button type="button" variant="ghost" size="sm">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" variant="lime" disabled={loading}>
                {loading ? 'Generating...' : 'Create Heartbeat'}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="p-8 space-y-6 border-[#C8F169]/40 bg-[#131E1E]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#19875D] font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Heartbeat Successfully Created</span>
            </div>
            <h2 className="text-xl font-bold text-white">{name}</h2>
            <p className="text-xs text-[#A0ADA7]">
              Copy your unique check-in URL. For security, the secret token is shown only once and its SHA-256 hash is saved.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#A0ADA7]">
              Your Check-in URL
            </label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={createdData.checkInUrl}
                className="font-mono text-xs bg-[#0D1515] text-[#C8F169]"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(createdData.checkInUrl)}
                className="h-10 text-xs shrink-0 gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#A0ADA7]">
              Drop-in Integration Code
            </label>
            <CodeBlock snippets={snippets} />
          </div>

          <div className="pt-4 border-t border-[#2C3936] flex justify-end">
            <Link href="/app/heartbeats">
              <Button variant="lime">Done &bull; View Heartbeats</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
