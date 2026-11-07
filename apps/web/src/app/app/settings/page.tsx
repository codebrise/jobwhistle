'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getStoredSession } from '@/lib/api-client';
import { productLimits } from '@jobwhistle/config';
import { User, HardDrive } from 'lucide-react';

export default function SettingsPage() {
  const session = getStoredSession();
  const [name, setName] = React.useState(session?.user?.name || 'Developer');
  const [saved, setSaved] = React.useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-xs text-[#A0ADA7] mt-1">
          Manage your account profile, workspace metadata, and check beta capacity limits.
        </p>
      </div>

      {/* Account Settings */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-[#2C3936] pb-4">
          <User className="w-5 h-5 text-[#C8F169]" />
          <div>
            <h2 className="text-base font-bold text-white">User Profile</h2>
            <p className="text-xs text-[#A0ADA7]">Personal account information.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#A0ADA7]">
              Display Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#A0ADA7]">
              Email Address
            </label>
            <Input
              disabled
              value={session?.user?.email || 'developer@codebrise.com'}
              className="opacity-70 bg-[#131E1E]"
            />
            <p className="text-[11px] text-[#687670]">
              To change your primary email, contact support@codebrise.com.
            </p>
          </div>

          <Button type="submit" variant="lime" size="sm">
            {saved ? 'Saved!' : 'Update Profile'}
          </Button>
        </form>
      </Card>

      {/* Beta Quota & Capacity */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-[#2C3936] pb-4">
          <HardDrive className="w-5 h-5 text-[#C8F169]" />
          <div>
            <h2 className="text-base font-bold text-white">Active Beta Limits & Usage</h2>
            <p className="text-xs text-[#A0ADA7]">
              Current workspace allocation backed by Cloudflare serverless edge infrastructure.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-[#0D1515] border border-[#2C3936] space-y-1">
            <div className="text-xs text-[#A0ADA7]">HTTP Monitors</div>
            <div className="text-xl font-bold text-white font-mono">
              Up to {productLimits.monitors}
            </div>
            <div className="text-[11px] text-[#687670]">5-minute check intervals</div>
          </div>

          <div className="p-4 rounded-lg bg-[#0D1515] border border-[#2C3936] space-y-1">
            <div className="text-xs text-[#A0ADA7]">Cron Heartbeats</div>
            <div className="text-xl font-bold text-white font-mono">
              Up to {productLimits.heartbeatMonitors}
            </div>
            <div className="text-[11px] text-[#687670]">Unique secret check-in URLs</div>
          </div>

          <div className="p-4 rounded-lg bg-[#0D1515] border border-[#2C3936] space-y-1">
            <div className="text-xs text-[#A0ADA7]">Data Retention</div>
            <div className="text-xl font-bold text-white font-mono">
              {productLimits.historyRetentionDays} Days
            </div>
            <div className="text-[11px] text-[#687670]">Granular raw checks stored</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
