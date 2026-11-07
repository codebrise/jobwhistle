'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '../ui/brand-logo';
import { Button } from '../ui/button';
import { headerNavItems } from '@/content/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#2C3936] bg-[#0D1515]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <BrandLogo href="/" />

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          {headerNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-[#C8F169]',
                pathname === item.href ? 'text-[#C8F169]' : 'text-[#A0ADA7]'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Action CTAs */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="lime" size="sm">
              Get Started Free
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#A0ADA7] hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#2C3936] bg-[#131E1E] px-4 pt-2 pb-6 space-y-4">
          <nav className="flex flex-col space-y-3">
            {headerNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-[#EAF0EC] hover:text-[#C8F169] py-1"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t border-[#2C3936] flex flex-col space-y-2">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="lime" className="w-full">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
