import { Card } from '@/components/ui/card';
import { brandConfig } from '@jobwhistle/config';

export const metadata = {
  title: 'About Jobwhistle & CodeBrise',
  description:
    'The product philosophy and engineering story behind Jobwhistle by CodeBrise.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-[#C8F169] tracking-widest uppercase">
          Parent Brand: {brandConfig.parentBrand}
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
          About Jobwhistle
        </h1>
        <p className="text-lg text-[#A0ADA7] max-w-2xl mx-auto">
          {brandConfig.tagline}
        </p>
      </div>

      <div className="space-y-8 text-[#EAF0EC] leading-relaxed text-sm sm:text-base">
        <Card className="p-8 space-y-4">
          <h2 className="text-xl font-bold text-white">Our Product Philosophy</h2>
          <p className="text-[#A0ADA7]">
            Most modern monitoring software has become bloated, expensive, and noisy. Developers are inundated with AI assistants, synthetic tracing charts, and enterprise upsells when all they genuinely need is a simple answer to two questions:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[#EAF0EC]">
            <li><strong>Is my website or API up and responding right now?</strong></li>
            <li><strong>Did my scheduled background job complete as expected?</strong></li>
          </ul>
          <p className="text-[#A0ADA7]">
            Jobwhistle is the first standalone product built under CodeBrise. We exist to provide lightweight, honest, and reliable signals. When something goes wrong, you get a clean alert. When it recovers, you get a quiet summary.
          </p>
        </Card>

        <Card className="p-8 space-y-4">
          <h2 className="text-xl font-bold text-white">Why Free-First?</h2>
          <p className="text-[#A0ADA7]">
            We designed Jobwhistle on serverless edge primitives (Cloudflare Workers, Cloudflare D1, and Resend). Because our infrastructure scales on demand without dedicated idle servers, we are able to provide genuinely useful free monitoring for indie developers, freelancers, and open-source creators without imposing artificial barriers.
          </p>
        </Card>
      </div>
    </div>
  );
}
