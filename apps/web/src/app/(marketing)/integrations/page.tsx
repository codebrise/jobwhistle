import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { integrationsContent } from '@/content/integrations';
import { Mail, Webhook, Send, MessageSquare, Bell, Smartphone } from 'lucide-react';

export const metadata = {
  title: 'Integrations & Alert Channels — Jobwhistle',
  description:
    'Notification channels supported by Jobwhistle: Email delivery via Resend, webhooks, and upcoming channels.',
};

export default function IntegrationsPage() {
  const iconMap: Record<string, React.ReactNode> = {
    email: <Mail className="w-5 h-5 text-[#C8F169]" />,
    webhook: <Webhook className="w-5 h-5 text-[#C8F169]" />,
    telegram: <Send className="w-5 h-5 text-[#347D72]" />,
    discord: <MessageSquare className="w-5 h-5 text-[#347D72]" />,
    slack: <MessageSquare className="w-5 h-5 text-[#347D72]" />,
    ntfy: <Bell className="w-5 h-5 text-[#347D72]" />,
    'mobile-push': <Smartphone className="w-5 h-5 text-[#347D72]" />,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
          {integrationsContent.title}
        </h1>
        <p className="text-lg text-[#A0ADA7]">{integrationsContent.subtitle}</p>
      </div>

      {/* Active Channels */}
      <div className="space-y-6">
        <div className="border-b border-[#2C3936] pb-3">
          <h2 className="text-xl font-bold text-white">Operational in V1 Release</h2>
          <p className="text-xs text-[#A0ADA7]">
            Active notification delivery adapters fully integrated with incident lifecycle dispatch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrationsContent.activeChannels.map((channel) => (
            <Card key={channel.id} className="p-6 space-y-3 border-[#C8F169]/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-[#142522] border border-[#2C3936]">
                    {iconMap[channel.id]}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{channel.name}</h3>
                    <span className="text-[10px] font-semibold text-[#19875D] uppercase tracking-wider">
                      Live &bull; Verified
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#C8F169]/15 text-[#C8F169] border border-[#C8F169]/30">
                  {channel.badge}
                </span>
              </div>
              <p className="text-sm text-[#A0ADA7] leading-relaxed">
                {channel.description}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Planned Roadmap Channels */}
      <div className="space-y-6">
        <div className="border-b border-[#2C3936] pb-3">
          <h2 className="text-xl font-bold text-white">Extensible Architecture Roadmap</h2>
          <p className="text-xs text-[#A0ADA7]">
            Designed with provider adapters ready to hook into team messaging and mobile push services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {integrationsContent.plannedChannels.map((channel) => (
            <Card key={channel.id} className="p-5 space-y-2.5 bg-[#0D1515]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded bg-[#131E1E] text-[#A0ADA7]">
                    {iconMap[channel.id]}
                  </div>
                  <h3 className="font-semibold text-white text-sm">{channel.name}</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C2928] text-[#A0ADA7] border border-[#2C3936]">
                  {channel.stage}
                </span>
              </div>
              <p className="text-xs text-[#A0ADA7] leading-relaxed">
                {channel.description}
              </p>
            </Card>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-[#2C3936] bg-[#142522] p-8 text-center space-y-3">
        <h3 className="text-xl font-bold text-white">Connect Your Email in 1 Click</h3>
        <p className="text-sm text-[#A0ADA7] max-w-lg mx-auto">
          Every new Jobwhistle workspace comes pre-configured with your registered email address so you receive down and recovery alerts immediately.
        </p>
        <div className="pt-2">
          <Link href="/register">
            <Button variant="lime">Get Started</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
