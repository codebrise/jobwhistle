import { Card } from '@/components/ui/card';

export const metadata = {
  title: 'Privacy Policy — Jobwhistle',
  description:
    'How Jobwhistle collects, processes, and protects your account and monitoring telemetry data.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div>
        <h1 className="text-4xl font-extrabold text-white">Privacy Policy</h1>
        <p className="text-sm text-[#A0ADA7] mt-2">
          Effective Date: November 2026 &bull; Version 1.0
        </p>
      </div>

      <Card className="p-8 space-y-8 text-sm text-[#EAF0EC] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">1. Introduction</h2>
          <p className="text-[#A0ADA7]">
            Jobwhistle (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;), operated under CodeBrise, respects your privacy. This policy outlines what data we collect, how we handle target monitoring endpoints, and how we safeguard your information.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">2. Monitoring Probes and User Authorization</h2>
          <p className="text-[#A0ADA7]">
            When you configure an HTTP monitor in Jobwhistle, <strong>you explicitly instruct Jobwhistle dispatchers to send periodic network requests to that URL</strong>. These requests include a transparent User-Agent header (<code>Jobwhistle-Monitor/1.0</code>). We record response headers, status codes, and latency measurements to compute uptime statistics.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">3. Data We Collect</h2>
          <ul className="list-disc pl-5 space-y-2 text-[#A0ADA7]">
            <li><strong className="text-white">Account Information:</strong> Name, email address, and hashed authentication credentials (PBKDF2).</li>
            <li><strong className="text-white">Monitoring Configurations:</strong> URLs, expected status codes, check intervals, and heartbeat parameters.</li>
            <li><strong className="text-white">Telemetry & Check Logs:</strong> Timestamps, response times in milliseconds, HTTP status codes, and failure error strings.</li>
            <li><strong className="text-white">Notification Destinations:</strong> Recipient email addresses and webhook endpoints.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">4. Data Retention Policy</h2>
          <p className="text-[#A0ADA7]">
            Raw probe check records are retained for <strong>7 days</strong> during our beta tier, after which they are systematically purged by scheduled database maintenance. Aggregated availability percentages and historical incident records are preserved to provide long-term service reliability context.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">5. Sub-Processors & Third Parties</h2>
          <p className="text-[#A0ADA7]">
            We rely on trusted infrastructure providers:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[#A0ADA7]">
            <li><strong className="text-white">Cloudflare:</strong> Edge Workers execution and D1 serverless database storage.</li>
            <li><strong className="text-white">Resend:</strong> Delivery of transactional incident alert and recovery emails.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">6. Account Deletion & Right to be Forgotten</h2>
          <p className="text-[#A0ADA7]">
            You have the right to request full account deletion at any time by contacting support@codebrise.com. Upon request, all monitors, heartbeats, check records, and session tokens are permanently erased.
          </p>
        </section>
      </Card>
    </div>
  );
}

