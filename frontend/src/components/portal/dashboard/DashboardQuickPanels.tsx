'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { portalConfig } from '@/config/portal.config';
import { portalQuickLinkIcons, portalQuickPanelIcons } from '@/components/portal/icon-map';

export function DashboardQuickPanels() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {portalConfig.dashboard.quickPanels.map((panel) => {
        const PanelIcon = portalQuickPanelIcons[panel.icon];

        return (
          <div
            key={panel.id}
            className="rounded-2xl border border-[var(--portal-border)] bg-white/80 p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-primary)]/12 text-[var(--brand-accent)]">
                <PanelIcon className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-[var(--portal-foreground)]">{panel.title}</h3>
            </div>

            <ul className="space-y-1">
              {panel.links.map((link) => {
                const LinkIcon =
                  'icon' in link && link.icon ? portalQuickLinkIcons[link.icon] : ChevronRight;
                const isExternal = link.href.startsWith('mailto:') || link.href.startsWith('tel:');
                const isAnchor = link.href.startsWith('/#');

                return (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      {...(isExternal || isAnchor ? { target: isAnchor ? undefined : undefined } : {})}
                      className="group flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-[var(--portal-body)] transition-colors hover:bg-[var(--brand-surface-muted)] hover:text-[var(--brand-accent)]"
                    >
                      <LinkIcon className="h-4 w-4 shrink-0 text-[var(--brand-primary)]" />
                      <span className="flex-1 truncate">{link.label}</span>
                      <ChevronRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-60" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
