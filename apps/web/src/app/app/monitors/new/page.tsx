'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/api-client';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { productLimits } from '@jobwhistle/config';

export default function NewMonitorPage() {
  const router = useRouter();
  const [name, setName] = React.useState('');
  const [url, setUrl] = React.useState('');
  const [method, setMethod] = React.useState<'GET' | 'HEAD' | 'POST'>('GET');
  const [intervalMinutes, setIntervalMinutes] = React.useState<number>(5);
  const [timeoutSeconds, setTimeoutSeconds] = React.useState<number>(10);
  const [expectedStatusCode, setExpectedStatusCode] = React.useState<number>(200);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Client-side quick SSRF feedback
  const ssrfWarning = React.useMemo(() => {
    if (!url) return null;
    const lower = url.toLowerCase();
    if (
      lower.includes('localhost') ||
      lower.includes('127.0.0.1') ||
      lower.includes('10.') ||
      lower.includes('192.168.') ||
      lower.includes('169.254.')
    ) {
      return 'Target points to a restricted loopback or internal network IP. Jobwhistle will reject this for SSRF protection.';
    }
    return null;
  }, [url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiRequest<{ id: string }>('/api/v1/monitors', {
        method: 'POST',
        body: JSON.stringify({
          name,
          url,
          method,
          intervalMinutes,
          timeoutSeconds,
          expectedStatusCode,
          active: true,
        }),
      });

      if (res.success && res.data) {
        router.push(`/app/monitors/${res.data.id}`);
      } else {
        setError(res.error?.message || 'Failed to create monitor. Check inputs.');
      }
    } catch {
      setError('An unexpected error occurred while creating monitor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/app/monitors">
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Create HTTP Monitor
          </h1>
          <p className="text-xs text-[#A0ADA7] mt-0.5">
            Configure automated probe monitoring for an endpoint.
          </p>
        </div>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[#D45252]/10 border border-[#D45252]/30 text-xs text-[#D45252]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {ssrfWarning && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[#C48A28]/10 border border-[#C48A28]/30 text-xs text-[#C48A28]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{ssrfWarning}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#A0ADA7]">
              Monitor Friendly Name
            </label>
            <Input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Production Web App or Payment Gateway"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#A0ADA7]">
              Target URL
            </label>
            <Input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/health"
            />
            <p className="text-[11px] text-[#687670]">
              Must start with http:// or https://. Verified against SSRF blocklists.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#A0ADA7]">
                HTTP Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as 'GET' | 'HEAD' | 'POST')}
                className="flex h-10 w-full rounded-lg border border-[#2C3936] bg-[#0D1515] px-3 py-2 text-sm text-[#EAF0EC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8F169]"
              >
                <option value="GET">GET</option>
                <option value="HEAD">HEAD</option>
                <option value="POST">POST</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#A0ADA7]">
                Check Interval
              </label>
              <select
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                className="flex h-10 w-full rounded-lg border border-[#2C3936] bg-[#0D1515] px-3 py-2 text-sm text-[#EAF0EC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8F169]"
              >
                <option value={1}>Every 1 minute</option>
                <option value={5}>Every 5 minutes (Default)</option>
                <option value={10}>Every 10 minutes</option>
                <option value={15}>Every 15 minutes</option>
                <option value={30}>Every 30 minutes</option>
                <option value={60}>Every 60 minutes</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#A0ADA7]">
                Expected Status
              </label>
              <Input
                type="number"
                min={100}
                max={599}
                value={expectedStatusCode}
                onChange={(e) => setExpectedStatusCode(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#A0ADA7]">
              Request Timeout (Seconds)
            </label>
            <Input
              type="number"
              min={1}
              max={productLimits.maxTimeoutSeconds}
              value={timeoutSeconds}
              onChange={(e) => setTimeoutSeconds(Number(e.target.value))}
            />
            <p className="text-[11px] text-[#687670]">
              Max {productLimits.maxTimeoutSeconds}s in free beta to prevent socket starvation.
            </p>
          </div>

          <div className="pt-4 border-t border-[#2C3936] flex items-center justify-between">
            <Link href="/app/monitors">
              <Button type="button" variant="ghost" size="sm">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="lime"
              disabled={loading || Boolean(ssrfWarning)}
            >
              {loading ? 'Creating & Probing...' : 'Create Monitor'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
