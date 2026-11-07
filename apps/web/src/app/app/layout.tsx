import { DashboardShell } from '@/components/layout/dashboard-shell';

export const metadata = {
  title: 'Dashboard — Jobwhistle',
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
