import { Card } from '@/components/ui/card';

export const metadata = {
  title: 'Terms of Service — Jobwhistle',
  description: 'Terms and conditions governing the use of the Jobwhistle monitoring platform.',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div>
        <h1 className="text-4xl font-extrabold text-white">Terms of Service</h1>
        <p className="text-sm text-[#A0ADA7] mt-2">
          Effective Date: November 2026 &bull; Version 1.0
        </p>
      </div>

      <Card className="p-8 space-y-8 text-sm text-[#EAF0EC] leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">1. Agreement to Terms</h2>
          <p className="text-[#A0ADA7]">
            By creating an account or using Jobwhistle (&quot;the Service&quot;), operated by CodeBrise, you agree to these Terms. If you disagree, do not use the Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">2. Acceptable Use Policy</h2>
          <p className="text-[#A0ADA7]">
            You agree only to monitor targets that you own, operate, or have explicit authorization to inspect. You must not:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[#A0ADA7]">
            <li>Configure Jobwhistle to conduct Denial-of-Service (DoS) or port scanning attacks against third-party networks.</li>
            <li>Attempt to bypass our SSRF defenses or target loopback (127.0.0.1) or internal RFC 1918 networks.</li>
            <li>Abuse heartbeat endpoints with high-frequency flood check-ins.</li>
            <li>Misrepresent incident reports or falsify service availability claims.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">3. Disclaimer of Warranties</h2>
          <p className="text-[#A0ADA7]">
            Jobwhistle is provided &quot;as is&quot; without warranties of any kind. While we strive for maximum precision and edge uptime, we do not warrant that alert delivery will be uninterrupted, error-free, or instantaneous. Jobwhistle is not an emergency response service and must not be used for life-critical infrastructure.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">4. Legal Review Notice</h2>
          <p className="text-[#A0ADA7]">
            These Terms provide initial operational clarity during public beta. A formal legal review will be conducted prior to commercial general availability.
          </p>
        </section>
      </Card>
    </div>
  );
}

