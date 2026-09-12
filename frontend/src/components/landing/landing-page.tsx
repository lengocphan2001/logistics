'use client';

import { LandingNavbar } from '@/components/landing/landing-navbar';
import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingTracking } from '@/components/landing/landing-tracking';
import {
  LandingCta,
  LandingHero,
  LandingServices,
  LandingStats,
  LandingSteps,
} from '@/components/landing/landing-sections';
import { useAuthStore } from '@/stores/auth.store';

export function LandingPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div className="landing-page min-h-screen">
      <LandingNavbar />
      <LandingHero />
      <LandingStats />
      <LandingServices />
      <LandingSteps />
      <LandingTracking />
      <LandingCta isAuthenticated={isAuthenticated} />
      <LandingFooter />
    </div>
  );
}
