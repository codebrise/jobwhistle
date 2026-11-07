'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BrandLogo } from '../ui/brand-logo';
import { Button } from '../ui/button';
import {
  LayoutDashboard,
  Activity,
  Clock,
  AlertTriangle,
  Bell,
  Settings,
  LogOut,
  Plus,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { getStoredSession, saveStoredSession } from '@/lib/api-client';
import { cn } from '@/lib/utils';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [session, setSession] = React.useState(getStoredSession());

  React.useEffect(() => {
    // If not logged in, initialize demo session so dashboard is immediately testable
    if (!session) {
      const demo = {
        user: {
          id: 'usr_demo',
          name: 'Developer',
          email: 'developer@codebrise.com',
          emailVerified: true,
          activeWorkspaceId: 'ws_demo',
          createdAt: new Date().toISOString(),
        },
        workspace: {
          id: 'ws_demo',
          name: "Developer's Workspace",
          slug: 'developer-workspace',
          ownerId: 'usr_demo',
          createdAt: new Date().toISOString(),
        },
        token: 'whistle_sess_demo',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      saveStoredSession(demo);
      setSession(demo);
    }
  }, [session]);

  const handleLogout = () => {
    saveStoredSession(null);
    router.push('/login');
  };

  const navLinks = [
    { label: 'Overview', href: '/app/overview', icon: LayoutDashboard },
    { label: 'Monitors', href: '/app/monitors', icon: Activity },
    { label: 'Heartbeats', href: '/app/heartbeats', icon: Clock },
    { label: 'Incidents', href: '/app/incidents', icon: AlertTriangle },
    { label: 'Notifications', href: '/app/notifications', icon: Bell },
    { label: 'Settings', href: '/app/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0D1515] text-[#EAF0EC] flex">
      {/* Desktop Sidebar (240px) */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 border-r border-[#2C3936] bg-[#131E1E] shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-[#2C3936]">
          <BrandLogo size="sm" href="/app/overview" />
        </div>

        {/* Workspace pill */}
        <div className="px-4 py-3 border-b border-[#2C3936]/60 bg-[#142522]/50">
          <div className="text-[10px] uppercase font-bold text-[#A9C5B1] tracking-wider">
            Workspace
          </div>
          <div className="text-xs font-semibold text-white truncate mt-0.5">
            {session?.workspace?.name || 'Main Workspace'}
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== '/app/overview' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-[#1C2928] text-[#C8F169] border border-[#2C3936]'
                    : 'text-[#A0ADA7] hover:text-white hover:bg-[#1C2928]/60'
                )}
              >
                <Icon className={cn('w-4 h-4', active ? 'text-[#C8F169]' : 'text-[#687670]')} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-[#2C3936] flex items-center justify-between">
          <div className="truncate mr-2">
            <div className="text-xs font-medium text-white truncate">
              {session?.user?.name || 'Developer'}
            </div>
            <div className="text-[10px] text-[#A0ADA7] truncate">
              {session?.user?.email || 'dev@codebrise.com'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 rounded text-[#A0ADA7] hover:text-[#D45252] hover:bg-[#1C2928] transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-[#2C3936] bg-[#131E1E]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#A0ADA7] hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#19875D] inline-block animate-pulse" />
              <span className="text-xs text-[#A0ADA7] font-medium hidden sm:inline">
                Probe Engine: Operational
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link href="/app/monitors/new">
              <Button variant="lime" size="sm" className="gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>New Monitor</span>
              </Button>
            </Link>
            <Link href="/" target="_blank" className="text-xs text-[#687670] hover:text-[#A0ADA7] hidden md:flex items-center gap-1">
              <span>Marketing Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Mobile Nav Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-[#2C3936] bg-[#131E1E] p-4 space-y-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium',
                    active ? 'bg-[#1C2928] text-[#C8F169]' : 'text-[#A0ADA7]'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-[#2C3936] flex items-center justify-between">
              <span className="text-xs text-[#A0ADA7]">{session?.user?.email}</span>
              <button
                onClick={handleLogout}
                className="text-xs text-[#D45252] flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
