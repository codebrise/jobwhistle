import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { featuresContent } from '@/content/features';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Features — Jobwhistle',
  description:
    'Complete technical overview of Jobwhistle HTTP/HTTPS monitoring, heartbeat cron tracking, and incident alerting.',
};

export default function FeaturesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
          {featuresContent.title}
        </h1>
        <p className="text-lg text-[#A0ADA7] leading-relaxed">
          {featuresContent.subtitle}
        </p>
      </div>

      <div className="space-y-16">
        {featuresContent.sections.map((section) => (
          <div key={section.category} className="space-y-6">
            <div className="border-b border-[#2C3936] pb-4">
              <span className="text-xs font-bold text-[#C8F169] uppercase tracking-wider">
                {section.category}
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                {section.headline}
              </h2>
              <p className="text-sm text-[#A0ADA7] mt-1">{section.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {section.items.map((item) => (
                <Card key={item.title} className="p-6 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C8F169] shrink-0" />
                    <h3 className="font-semibold text-white text-base">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-sm text-[#A0ADA7] leading-relaxed pl-6">
                    {item.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[#2C3936] bg-[#142522] p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">
          Ready to set up your first monitor?
        </h2>
        <p className="text-sm text-[#A0ADA7]">
          Get started free in less than 60 seconds with no credit card required.
        </p>
        <Link href="/register">
          <Button variant="lime" className="gap-2">
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

