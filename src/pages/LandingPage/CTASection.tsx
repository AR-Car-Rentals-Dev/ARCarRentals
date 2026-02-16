import type { FC } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';

/**
 * Call to Action section
 */
export const CTASection: FC = () => {
  return (
    <section className="py-20 bg-neutral-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mx-auto w-full max-w-[1600px] bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden relative"
        style={{ paddingInline: 'clamp(1.5rem, 3vw, 3rem)' }}
      >
        {/* Background Image */}
        <div className="absolute inset-0 bg-[url('/CCLEXOverlay.png')] bg-cover bg-center opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>

        {/* Content */}
        <div className="flex flex-col md:flex-row items-center justify-between p-12 md:p-16 relative z-10 gap-10">
          <div className="md:max-w-xl">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Discover Your Perfect Ride</h2>
            <p className="text-neutral-300 text-lg leading-relaxed">
              From compact sedans to spacious SUVs, find the ideal vehicle for your Cebu adventure. Browse our premium fleet and hit the road today.
            </p>
          </div>
          <div className="flex-shrink-0">
            <Button
              variant="primary"
              size="lg"
              onClick={() => (window.location.href = '/browsevehicles')}
              className="inline-flex items-center gap-3 bg-[#E22B2B] hover:bg-white hover:text-black text-white px-10 py-5 rounded-lg font-bold uppercase tracking-widest text-sm transition-all duration-300 shadow-xl"
            >
              View Fleet
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;
