import { PortalLayoutClient } from '@/components/layout/PortalLayoutClient';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayoutClient>{children}</PortalLayoutClient>;
}
