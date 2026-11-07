import { Card } from '@/components/ui/card';
import { ShieldCheck, Lock, AlertOctagon, Terminal } from 'lucide-react';

export const metadata = {
  title: 'Security & SSRF Architecture — Jobwhistle',
  description:
    'Detailed overview of Jobwhistle security posture, SSRF validation filter, cryptographic token design, and data isolation.',
};

export default function SecurityPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#1C2928] text-[#C8F169] border border-[#2C3936]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Security & Defense Whitepaper</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white">Security Architecture</h1>
        <p className="text-[#A0ADA7] text-base leading-relaxed">
          Probing user-provided endpoints introduces severe SSRF (Server-Side Request Forgery) risks. Jobwhistle is engineered with defense-in-depth safeguards at the protocol, DNS, and application layers.
        </p>
      </div>

      <div className="space-y-8">
        <Card className="p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#142522] border border-[#2C3936] text-[#C8F169]">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">1. Multi-Layer SSRF Defense Engine</h2>
          </div>
          <p className="text-sm text-[#A0ADA7] leading-relaxed">
            Before any HTTP request is initiated, the destination target is inspected by our validation filter:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-sm text-[#A0ADA7]">
            <li><strong className="text-white">Strict Protocol Whitelist:</strong> Only <code>http:</code> and <code>https:</code> are permitted. Unsafe schemes such as <code>file:</code>, <code>gopher:</code>, <code>ftp:</code>, or <code>data:</code> are rejected.</li>
            <li><strong className="text-white">Private IPv4 Filter:</strong> Rejects loopback (127.0.0.0/8), private LANs (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16), carrier-grade NAT (100.64.0.0/10), and current network (0.0.0.0/8).</li>
            <li><strong className="text-white">Private IPv6 Guard:</strong> Rejects loopback (::1), link-local (fe80::/10), unique local (fc00::/7), and IPv4-mapped IPv6 ranges.</li>
            <li><strong className="text-white">Cloud Metadata Shield:</strong> Blocks AWS/GCP/Azure link-local metadata (<code>169.254.169.254</code>) and hostnames (<code>metadata.google.internal</code>).</li>
            <li><strong className="text-white">Port Filtering:</strong> Restricts probe traffic to standard web ports (80, 443, 8080, 8443, etc.) preventing intranet port scans against internal databases (Redis 6379, Postgres 5432, Docker 2375).</li>
            <li><strong className="text-white">Hop-by-Hop Redirect Re-Validation:</strong> Every HTTP redirect hop (301, 302, 307, 308) is intercepted and re-validated against the SSRF engine before making the subsequent request.</li>
          </ul>
        </Card>

        <Card className="p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#142522] border border-[#2C3936] text-[#C8F169]">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">2. Cryptographic Secret Storage</h2>
          </div>
          <p className="text-sm text-[#A0ADA7] leading-relaxed">
            Heartbeat tokens are generated using Web Crypto with 192 bits of entropy. We never store plaintext check-in tokens in our database. Instead, only the <strong>SHA-256 hash</strong> of the token is retained, making secret reconstruction from database backups mathematically impossible.
          </p>
        </Card>

        <Card className="p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#142522] border border-[#2C3936] text-[#C8F169]">
              <Terminal className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">3. Memory & Socket Bounding</h2>
          </div>
          <p className="text-sm text-[#A0ADA7] leading-relaxed">
            To prevent denial-of-service against our dispatchers, each probe enforces a hard 15-second timeout via <code>AbortSignal</code> and cancels body consumption after reading 512 KB.
          </p>
        </Card>
      </div>
    </div>
  );
}

