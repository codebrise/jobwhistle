'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/api-client';
import { Mail, Webhook, Trash2, Plus, AlertCircle } from 'lucide-react';
import type { NotificationChannelRecord } from '@jobwhistle/contracts';
import { productLimits } from '@jobwhistle/config';

export default function NotificationsSettingsPage() {
  const [channels, setChannels] = React.useState<NotificationChannelRecord[]>([]);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [name, setName] = React.useState('');
  const [destination, setDestination] = React.useState('');
  const [provider, setProvider] = React.useState<'email' | 'webhook'>('email');
  const [error, setError] = React.useState<string | null>(null);

  // Preferences
  const [notifyOnDown, setNotifyOnDown] = React.useState(true);
  const [notifyOnRecovery, setNotifyOnRecovery] = React.useState(true);
  const [savingPrefs, setSavingPrefs] = React.useState(false);

  const fetchChannels = async () => {
    const res = await apiRequest<NotificationChannelRecord[]>('/api/v1/notifications/channels');
    if (res.success && res.data) {
      setChannels(res.data);
    }
    const prefRes = await apiRequest<{ notifyOnDown: boolean; notifyOnRecovery: boolean }>(
      '/api/v1/notifications/preferences'
    );
    if (prefRes.success && prefRes.data) {
      setNotifyOnDown(prefRes.data.notifyOnDown);
      setNotifyOnRecovery(prefRes.data.notifyOnRecovery);
    }
  };

  React.useEffect(() => {
    fetchChannels();
  }, []);

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = await apiRequest<NotificationChannelRecord>('/api/v1/notifications/channels', {
      method: 'POST',
      body: JSON.stringify({ name, provider, destination }),
    });

    if (res.success && res.data) {
      setChannels([...channels, res.data]);
      setShowAddModal(false);
      setName('');
      setDestination('');
    } else {
      setError(res.error?.message || 'Failed to add channel.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this notification channel?')) return;
    await apiRequest(`/api/v1/notifications/channels/${id}`, { method: 'DELETE' });
    setChannels(channels.filter((c) => c.id !== id));
  };

  const handleSavePreferences = async () => {
    setSavingPrefs(true);
    await apiRequest('/api/v1/notifications/preferences', {
      method: 'PATCH',
      body: JSON.stringify({ notifyOnDown, notifyOnRecovery }),
    });
    setSavingPrefs(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Notification Channels</h1>
        <p className="text-xs text-[#A0ADA7] mt-1">
          Configure where Jobwhistle dispatches downtime alerts and recovery notifications.
        </p>
      </div>

      {/* Alert Destinations Card */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Active Destinations</h2>
            <p className="text-xs text-[#A0ADA7]">
              {channels.length} of {productLimits.notificationChannels} channels configured (Free Beta quota).
            </p>
          </div>

          <Button
            variant="lime"
            size="sm"
            onClick={() => setShowAddModal(!showAddModal)}
            disabled={channels.length >= productLimits.notificationChannels}
            className="text-xs gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Channel</span>
          </Button>
        </div>

        {showAddModal && (
          <form onSubmit={handleAddChannel} className="p-4 rounded-lg bg-[#0D1515] border border-[#2C3936] space-y-4">
            <h3 className="text-sm font-bold text-white">Add Notification Destination</h3>

            {error && (
              <div className="flex items-center gap-2 p-2.5 rounded bg-[#D45252]/10 text-xs text-[#D45252]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-[#A0ADA7] font-semibold uppercase">Name / Label</label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. On-Call Engineering"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-[#A0ADA7] font-semibold uppercase">Channel Type</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as 'email' | 'webhook')}
                  className="flex h-10 w-full rounded-lg border border-[#2C3936] bg-[#0D1515] px-3 py-2 text-sm text-[#EAF0EC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8F169]"
                >
                  <option value="email">Email</option>
                  <option value="webhook">HTTP Webhook</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#A0ADA7] font-semibold uppercase">
                {provider === 'email' ? 'Recipient Email Address' : 'Webhook Destination URL'}
              </label>
              <Input
                required
                type={provider === 'email' ? 'email' : 'url'}
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={provider === 'email' ? 'alerts@yourteam.com' : 'https://hooks.yourdomain.com/alerts'}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="lime" size="sm">
                Save Channel
              </Button>
            </div>
          </form>
        )}

        <div className="divide-y divide-[#2C3936]/60">
          {channels.map((chan) => (
            <div key={chan.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-[#1C2928] text-[#C8F169]">
                  {chan.provider === 'email' ? <Mail className="w-4 h-4" /> : <Webhook className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{chan.name}</div>
                  <div className="text-xs font-mono text-[#A0ADA7]">{chan.destination}</div>
                </div>
              </div>

              <button
                onClick={() => handleDelete(chan.id)}
                className="p-2 text-[#A0ADA7] hover:text-[#D45252] transition-colors"
                title="Delete channel"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Preferences Card */}
      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-base font-bold text-white">Alert Trigger Preferences</h2>
          <p className="text-xs text-[#A0ADA7]">
            Control which lifecycle events trigger automated notification dispatch.
          </p>
        </div>

        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyOnDown}
              onChange={(e) => setNotifyOnDown(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[#2C3936] bg-[#0D1515] text-[#C8F169] focus:ring-[#C8F169]"
            />
            <div>
              <div className="text-sm font-semibold text-white">Incident Confirmation Alert</div>
              <p className="text-xs text-[#A0ADA7]">
                Dispatch an immediate alert when an HTTP monitor fails 2 consecutive checks or a cron heartbeat deadline passes.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyOnRecovery}
              onChange={(e) => setNotifyOnRecovery(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[#2C3936] bg-[#0D1515] text-[#C8F169] focus:ring-[#C8F169]"
            />
            <div>
              <div className="text-sm font-semibold text-white">Recovery Notification</div>
              <p className="text-xs text-[#A0ADA7]">
                Dispatch an email when a previously failing endpoint resumes normal operation, reporting exact downtime duration.
              </p>
            </div>
          </label>
        </div>

        <div className="pt-4 border-t border-[#2C3936] flex justify-end">
          <Button variant="lime" size="sm" onClick={handleSavePreferences} disabled={savingPrefs}>
            {savingPrefs ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
