import type { FC } from 'react';

import { HeroSection } from './HeroSection';
import { TestimonialsSection } from './TestimonialsSection';
import { FeaturedFleetSection } from './FeaturedFleetSection';
import { HowItWorksSection } from './HowItWorksSection';
import { StatsSection } from './StatsSection';
import { InfiniteScrollGallerySection } from './DomeGallerySection';
import { CTASection } from './CTASection';
import { FloatingContactButtons } from '@/components/ui/FloatingContactButtons';

/**
 * Landing/Home page component
 */
export const LandingPage: FC = () => {
  return (
    <>
      <HeroSection />
      <TestimonialsSection />
      <FeaturedFleetSection />
      <HowItWorksSection />
      <StatsSection />
      <InfiniteScrollGallerySection />
      <CTASection />
      <FloatingContactButtons />
    </>
  );
};

export default LandingPage;
