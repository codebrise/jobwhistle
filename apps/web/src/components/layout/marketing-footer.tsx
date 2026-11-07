import Link from 'next/link';
import { BrandLogo } from '../ui/brand-logo';
import { footerContent } from '@/content/footer';

export function MarketingFooter() {
  return (
    <footer className="border-t border-[#2C3936] bg-[#0D1515] text-[#A0ADA7] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <BrandLogo size="md" />
            <p className="text-sm text-[#A0ADA7] max-w-sm leading-relaxed">
              Lightweight website uptime, API endpoints, and scheduled-job monitoring. Know when something goes quiet.
            </p>
            <div className="flex items-center space-x-2 text-xs text-[#687670]">
              <span className="w-2 h-2 rounded-full bg-[#19875D] inline-block animate-pulse" />
              <span>All Systems Operational &bull; Free-first Edge Architecture</span>
            </div>
          </div>

          {/* Links Columns */}
          {footerContent.columns.map((col) => (
            <div key={col.title} className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-[#C8F169] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#2C3936]/60 flex flex-col sm:flex-row items-center justify-between text-xs text-[#687670]">
          <div>{footerContent.copyright}</div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-6">
            <span>Parent Brand: CodeBrise</span>
            <span>&bull;</span>
            <Link href="https://github.com/codebrise/jobwhistle" className="hover:text-[#A0ADA7]">
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
