import { Card } from '@/components/ui/card';

export const metadata = {
  title: 'Changelog — Jobwhistle',
  description: 'Release history and updates for Jobwhistle.',
};

export default function ChangelogPage() {
  const releases = [
    {
      version: 'v1.0.0-beta',
      date: 'November 2026',
      title: 'Initial Public Release',
      description:
        'Jobwhistle launches with core HTTP/HTTPS probing, cron heartbeat tracking, idempotent incident management, and Resend email alerts.',
      changes: [
        'Deterministic HTTP/HTTPS probe dispatcher on Cloudflare Workers edge nodes.',
        'Scheduled-job heartbeat tracking with cryptographically secure secret tokens.',
        'Mandatory two-check consecutive failure confirmation rule to eliminate false alarms.',
        'SSRF defense suite protecting private IPv4/IPv6, cloud metadata, and internal ports.',
        'Transactional email notifications powered by Resend with verified DKIM/SPF.',
        'Interactive developer dashboard with real 24h & 7d availability statistics.',
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-extrabold text-white">Changelog</h1>
        <p className="text-[#A0ADA7]">
          Documenting the evolution of Jobwhistle from V1 onward.
        </p>
      </div>

      <div className="space-y-8">
        {releases.map((rel) => (
          <Card key={rel.version} className="p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2C3936] pb-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold bg-[#C8F169]/15 text-[#C8F169] px-2.5 py-1 rounded border border-[#C8F169]/30">
                  {rel.version}
                </span>
                <h2 className="text-xl font-bold text-white">{rel.title}</h2>
              </div>
              <span className="text-xs font-mono text-[#A0ADA7]">{rel.date}</span>
            </div>

            <p className="text-sm text-[#A0ADA7] leading-relaxed">{rel.description}</p>

            <ul className="space-y-2 pt-2">
              {rel.changes.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#EAF0EC]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C8F169] shrink-0 mt-2" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
