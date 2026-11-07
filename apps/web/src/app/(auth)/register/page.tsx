'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/ui/brand-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { apiRequest, saveStoredSession } from '@/lib/api-client';
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { AuthSession } from '@jobwhistle/contracts';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiRequest<AuthSession>('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });

      if (res.success && res.data) {
        saveStoredSession(res.data);
        router.push('/app/overview');
      } else {
        setError(res.error?.message || 'Registration failed. Check inputs.');
      }
    } catch {
      setError('An error occurred during registration. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1515] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        <BrandLogo size="lg" />
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Create your free monitoring account
        </h2>
        <p className="text-xs text-[#A0ADA7]">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[#C8F169] hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-[#D45252]/10 border border-[#D45252]/30 text-xs text-[#D45252]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#A0ADA7]">
                Your Name / Team
              </label>
              <Input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Developer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#A0ADA7]">
                Work Email Address
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@domain.com"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#A0ADA7]">
                Password (min 8 characters)
              </label>
              <Input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="new-password"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="lime"
                size="lg"
                className="w-full gap-2"
                disabled={loading}
              >
                <span>{loading ? 'Creating Account...' : 'Get Started Free'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-[#2C3936] space-y-2 text-xs text-[#A0ADA7]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#19875D]" />
              <span>3 HTTP monitors + 3 heartbeat cron monitors included</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#19875D]" />
              <span>No credit card required. Free during public beta.</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

