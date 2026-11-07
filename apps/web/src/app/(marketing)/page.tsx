import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/badge';
import { homepageContent } from '@/content/homepage';
import { faqContent } from '@/content/faq';
import {
  Activity,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Terminal,
  Zap,
} from 'lucide-react';

export default function HomePage() {
  const { hero, capabilities, howItWorks, metricsHighlight } = homepageContent;

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-12 overflow-hidden border-b border-[#2C3936]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#1C2928] border border-[#2C3936] text-[#C8F169] mb-8">
            <span className="w-2 h-2 rounded-full bg-[#C8F169] animate-pulse" />
            <span dangerouslySetInnerHTML={{ __html: hero.badge }} />
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.08]">
            Know when something{' '}
            <span className="text-[#C8F169] inline-block">goes quiet.</span>
          </h1>

          {/* Subhead */}
          <p className="mt-6 text-lg sm:text-xl text-[#A0ADA7] max-w-2xl mx-auto leading-relaxed">
            {hero.subhead}
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={hero.primaryCta.href}>
              <Button variant="lime" size="lg" className="w-full sm:w-auto gap-2">
                <span>{hero.primaryCta.label}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href={hero.secondaryCta.href}>
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                {hero.secondaryCta.label}
              </Button>
            </Link>
          </div>

          <div className="mt-4 text-xs text-[#687670]">{hero.endorsement}</div>

          {/* ACTUAL PRODUCT INTERFACE PREVIEW */}
          <div className="mt-16 max-w-5xl mx-auto rounded-xl border border-[#2C3936] bg-[#131E1E] shadow-2xl overflow-hidden text-left">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#2C3936] bg-[#142522]">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#D45252]/60" />
                <div className="w-3 h-3 rounded-full bg-[#C48A28]/60" />
                <div className="w-3 h-3 rounded-full bg-[#19875D]/60" />
                <span className="text-xs font-mono text-[#A0ADA7] ml-2">
                  jobwhistle://dashboard/overview
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#19875D] animate-pulse" />
                <span className="text-xs font-mono text-[#C8F169]">Edge Telemetry Live</span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Metrics Summary Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-[#0D1515] border border-[#2C3936]">
                  <div className="text-xs text-[#A0ADA7] uppercase tracking-wider">Monitors</div>
                  <div className="text-2xl font-bold text-white mt-1 tabular-nums">2 / 3 Active</div>
                  <div className="text-xs text-[#19875D] mt-1 font-medium">100% Operational</div>
                </div>
                <div className="p-4 rounded-lg bg-[#0D1515] border border-[#2C3936]">
                  <div className="text-xs text-[#A0ADA7] uppercase tracking-wider">Heartbeats</div>
                  <div className="text-2xl font-bold text-white mt-1 tabular-nums">1 Active</div>
                  <div className="text-xs text-[#19875D] mt-1 font-medium">Next in 20h</div>
                </div>
                <div className="p-4 rounded-lg bg-[#0D1515] border border-[#2C3936]">
                  <div className="text-xs text-[#A0ADA7] uppercase tracking-wider">Avg Latency</div>
                  <div className="text-2xl font-bold text-white mt-1 tabular-nums">115ms</div>
                  <div className="text-xs text-[#A0ADA7] mt-1">Global P95</div>
                </div>
                <div className="p-4 rounded-lg bg-[#0D1515] border border-[#2C3936]">
                  <div className="text-xs text-[#A0ADA7] uppercase tracking-wider">Incidents</div>
                  <div className="text-2xl font-bold text-white mt-1 tabular-nums">0 Open</div>
                  <div className="text-xs text-[#19875D] mt-1">Calm & Quiet</div>
                </div>
              </div>

              {/* Live Monitor Table Mockup */}
              <div className="rounded-lg border border-[#2C3936] bg-[#0D1515] overflow-hidden">
                <div className="px-4 py-3 bg-[#142522] border-b border-[#2C3936] text-xs font-semibold uppercase tracking-wider text-[#A0ADA7] grid grid-cols-12 gap-2">
                  <span className="col-span-5">Service / Target</span>
                  <span className="col-span-2">Interval</span>
                  <span className="col-span-2">Status</span>
                  <span className="col-span-3 text-right">24h Availability</span>
                </div>

                <div className="divide-y divide-[#2C3936]/60">
                  <div className="px-4 py-3.5 grid grid-cols-12 gap-2 items-center text-sm">
                    <div className="col-span-5 truncate">
                      <div className="font-semibold text-white">Production Marketing Site</div>
                      <div className="text-xs font-mono text-[#A0ADA7] truncate">https://codebrise.com</div>
                    </div>
                    <div className="col-span-2 text-xs font-mono text-[#A0ADA7]">Every 5m</div>
                    <div className="col-span-2">
                      <StatusBadge status="up" />
                    </div>
                    <div className="col-span-3 text-right text-xs font-bold text-[#C8F169] tabular-nums">
                      100.0% (142ms)
                    </div>
                  </div>

                  <div className="px-4 py-3.5 grid grid-cols-12 gap-2 items-center text-sm">
                    <div className="col-span-5 truncate">
                      <div className="font-semibold text-white">Authentication API Gateway</div>
                      <div className="text-xs font-mono text-[#A0ADA7] truncate">https://auth.codebrise.com/health</div>
                    </div>
                    <div className="col-span-2 text-xs font-mono text-[#A0ADA7]">Every 1m</div>
                    <div className="col-span-2">
                      <StatusBadge status="up" />
                    </div>
                    <div className="col-span-3 text-right text-xs font-bold text-[#C8F169] tabular-nums">
                      99.8% (89ms)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. METRICS HIGHLIGHTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricsHighlight.map((m) => (
            <Card key={m.label} className="p-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#A0ADA7]">
                {m.label}
              </div>
              <div className="text-2xl font-bold text-white mt-2">{m.value}</div>
              <div className="text-xs text-[#687670] mt-1">{m.sub}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. CAPABILITIES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Everything You Need to Detect Failure.
          </h2>
          <p className="text-[#A0ADA7] text-lg">
            No complex tracing dashboards, no noisy flutters, no expensive enterprise subscriptions.
          </p>
        </div>

        <div className="space-y-12">
          {capabilities.map((cap, idx) => (
            <div
              key={cap.id}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
                idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className="lg:col-span-6 space-y-4">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#C8F169] tracking-wider uppercase">
                  {idx === 0 ? <Activity className="w-4 h-4" /> : idx === 1 ? <Clock className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>{cap.title}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white">
                  {cap.tagline}
                </h3>
                <p className="text-[#A0ADA7] leading-relaxed">
                  {cap.description}
                </p>
                <ul className="space-y-2 pt-2">
                  {cap.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm text-[#EAF0EC]">
                      <CheckCircle2 className="w-4 h-4 text-[#C8F169] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lg:col-span-6">
                <div className="rounded-xl border border-[#2C3936] bg-[#0D1515] p-5 font-mono text-xs text-[#EAF0EC] leading-relaxed shadow-lg">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#2C3936] text-[#687670]">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-[#C8F169]" />
                      <span>Telemetry Terminal</span>
                    </span>
                    <span className="text-[10px]">Jobwhistle Engine</span>
                  </div>
                  <pre className="overflow-x-auto whitespace-pre-wrap text-[#A9C5B1]">
                    {cap.codePreview}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SETUP STEPS */}
      <section className="border-y border-[#2C3936] bg-[#131E1E] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white">
              Up and Running in 60 Seconds
            </h2>
            <p className="text-[#A0ADA7] mt-3">
              No software to install on your hosts. Just enter your endpoint URL or ping your heartbeat token.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((step) => (
              <div key={step.step} className="p-6 rounded-xl border border-[#2C3936] bg-[#0D1515] space-y-3">
                <div className="text-3xl font-extrabold text-[#C8F169] font-mono">
                  {step.step}
                </div>
                <h3 className="text-lg font-bold text-white">{step.title}</h3>
                <p className="text-sm text-[#A0ADA7] leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
          <p className="text-[#A0ADA7]">
            Clear, honest answers about our product, architecture, and free-first limits.
          </p>
        </div>

        <div className="space-y-4">
          {faqContent.map((faq, i) => (
            <Card key={i} className="p-6">
              <h3 className="text-base font-semibold text-white">{faq.question}</h3>
              <p className="text-sm text-[#A0ADA7] mt-2 leading-relaxed">{faq.answer}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* 6. FINAL CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[#2C3936] bg-gradient-to-b from-[#142522] to-[#0D1515] p-10 sm:p-16 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#C8F169]/10 text-[#C8F169] border border-[#C8F169]/30">
            <Zap className="w-3.5 h-3.5" />
            <span>Ready for Production Testing</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white max-w-2xl mx-auto">
            Stop guessing if your background jobs ran.
          </h2>
          <p className="text-[#A0ADA7] max-w-xl mx-auto text-base sm:text-lg">
            Create your free Jobwhistle account today. Set up an uptime check or cron heartbeat in under a minute.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button variant="lime" size="lg" className="w-full sm:w-auto">
                Create Free Account
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Read the Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
