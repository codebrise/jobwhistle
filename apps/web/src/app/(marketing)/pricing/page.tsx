import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { pricingContent } from '@/content/pricing';
import { Check } from 'lucide-react';

export const metadata = {
  title: 'Pricing — Jobwhistle',
  description:
    'Transparent free-first monitoring limits for Jobwhistle during public beta.',
};

export default function PricingPage() {
  const { plan, quotas } = pricingContent;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
          {pricingContent.title}
        </h1>
        <p className="text-lg text-[#A0ADA7]">{pricingContent.subtitle}</p>
      </div>

      {/* Plan Card */}
      <div className="max-w-xl mx-auto">
        <Card className="p-8 border-[#C8F169]/40 bg-[#131E1E] shadow-2xl relative">
          <div className="absolute -top-3 right-6 bg-[#C8F169] text-[#142522] text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
            Active Beta
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
              <p className="text-sm text-[#A0ADA7] mt-1">{plan.description}</p>
            </div>

            <div className="flex items-baseline gap-2 pt-2">
              <span className="text-5xl font-extrabold text-white">{plan.price}</span>
              <span className="text-sm text-[#A0ADA7]">{plan.billingPeriod}</span>
            </div>

            <div className="pt-4 border-t border-[#2C3936] space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#A0ADA7]">
                Included Limits
              </div>
              <ul className="space-y-2.5">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-sm text-[#EAF0EC]">
                    <Check className="w-4 h-4 text-[#C8F169] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6">
              <Link href={plan.cta.href}>
                <Button variant="lime" size="lg" className="w-full font-bold">
                  {plan.cta.label}
                </Button>
              </Link>
              <p className="text-xs text-center text-[#687670] mt-3">{plan.note}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quotas & Limits Explanation */}
      <div className="space-y-6 pt-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">
            Infrastructure Capacity & Technical Guardrails
          </h2>
          <p className="text-sm text-[#A0ADA7]">
            Why we establish clear boundaries rather than making unrealistic unlimited promises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quotas.map((q) => (
            <div
              key={q.metric}
              className="p-5 rounded-lg border border-[#2C3936] bg-[#0D1515] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-sm">{q.metric}</span>
                  <span className="text-xs font-mono font-bold text-[#C8F169] bg-[#C8F169]/10 px-2 py-0.5 rounded">
                    {q.limit}
                  </span>
                </div>
                <p className="text-xs text-[#A0ADA7] mt-2 leading-relaxed">
                  {q.explanation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
