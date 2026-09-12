'use client';

import Link from 'next/link';
import { portalConfig } from '@/config/portal.config';
import { portalQuickLinkIcons } from '@/components/portal/icon-map';
import { icon } from '@/lib/icon';

export function DashboardQuickPanels() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {portalConfig.dashboard.quickPanels.map((panel) => (
        /* Section headings carry no icon of their own — only the links that
           name a concrete action (deposit, withdraw, track) get one. */
        <nav key={panel.id} aria-label={panel.title}>
          <h3 className="border-b border-[var(--rule)] pb-2 font-heading text-sm font-semibold text-[var(--ink)]">
            {panel.title}
          </h3>
          <ul className="mt-2">
            {panel.links.map((link) => {
              const LinkIcon =
                'icon' in link && link.icon ? portalQuickLinkIcons[link.icon] : null;

              return (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 rounded-[var(--radius-control)] px-2 py-2 text-sm text-[var(--graphite)] hover:bg-[var(--wash)] hover:text-[var(--ink)]"
                  >
                    {LinkIcon && (
                      <LinkIcon {...icon('inline')} aria-hidden className="shrink-0" />
                    )}
                    <span className="flex-1 truncate">{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ))}
    </div>
  );
}
