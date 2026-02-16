import type { FC } from 'react';
import { Helmet } from 'react-helmet-async';
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
      <Helmet>
        <title>AR Car Rental Services | Best Car Rental & Tour Services in Cebu City</title>
      </Helmet>
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
