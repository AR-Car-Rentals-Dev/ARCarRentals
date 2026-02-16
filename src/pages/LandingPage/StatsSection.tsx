import { type FC } from 'react';
import { motion } from 'framer-motion';

/**
 * Stats Section - Showcasing company achievements and metrics
 */
export const StatsSection: FC = () => {
  const stats = [
    {
      number: '5000+',
      label: 'Happy Customers',
    },
    {
      number: '8+',
      label: 'Years of Excellence',
    },
    {
      number: '50+',
      label: 'Premium Vehicles',
    },
    {
      number: '24/7',
      label: 'Customer Support',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white min-h-[60vh] flex items-center">
      <div className="mx-auto w-full max-w-[1600px]" style={{ paddingInline: 'clamp(1.5rem, 3vw, 3rem)' }}>
        {/* Container with stroke */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="border-2 border-neutral-200 rounded-3xl p-8 sm:p-12 bg-white"
        >
          {/* Header - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-8">
            {/* Column 1 - Title */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                More Than Rentals,<br />
                It's an Experience
              </h2>
            </div>

            {/* Column 2 - Subtext */}
            <div className="flex items-center">
              <p className="text-neutral-600 text-base leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                AR Car Rentals transforms your journey into unforgettable experiences. We craft services that inspire, connect, and leave lasting memories across Cebu.
              </p>
            </div>
          </div>

          {/* Divider Line */}
          <div className="w-full h-px bg-neutral-200 mb-8"></div>

          {/* Stats Grid - No stroke on cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center p-8 rounded-2xl bg-white"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <div className="text-4xl sm:text-5xl font-bold text-[#E22B2B] mb-3">
                  {stat.number}
                </div>
                <div className="text-sm sm:text-base text-neutral-600 text-center font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
