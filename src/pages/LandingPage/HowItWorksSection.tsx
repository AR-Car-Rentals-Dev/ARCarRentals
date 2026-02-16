import { type FC, useState } from 'react';
import { Search, CreditCard, ShieldCheck, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: typeof Search;
  image: string;
}

const steps: Step[] = [
  {
    id: 1,
    title: 'Browse & Choose',
    description: 'Explore our wide range of vehicles and select the perfect car that fits your travel needs.',
    icon: Search,
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=80', // Car browsing
  },
  {
    id: 2,
    title: 'Book & Pay',
    description: 'Submit your booking details and make a secure payment to reserve your chosen vehicle.',
    icon: CreditCard,
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80', // Luxury car
  },
  {
    id: 3,
    title: 'Quick Approval',
    description: 'Our team performs a fast review of your documents. Approval usually happens within minutes.',
    icon: ShieldCheck,
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80', // Bridge/road
  },
  {
    id: 4,
    title: 'Drive Away',
    description: 'Pick up your car or have it delivered. Enjoy your trip around Cebu with complete peace of mind.',
    icon: KeyRound,
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80', // Car on road
  },
];

/**
 * How It Works Section - Interactive step-by-step guide
 */
export const HowItWorksSection: FC = () => {
  const [activeStep, setActiveStep] = useState(1);

  const currentStep = steps.find(step => step.id === activeStep) || steps[0];

  // Get thumbnail images in rotation order (next 3 steps after active, wrapping around)
  const getThumbnailSteps = () => {
    const activeIndex = steps.findIndex(step => step.id === activeStep);
    const thumbnails = [];

    for (let i = 1; i <= 3; i++) {
      const nextIndex = (activeIndex + i) % steps.length;
      thumbnails.push(steps[nextIndex]);
    }

    return thumbnails;
  };

  const thumbnailSteps = getThumbnailSteps();

  return (
    <section
      className="bg-white flex items-center"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: '70vh' }}
    >
      <div className="mx-auto w-full max-w-[1600px]" style={{ paddingInline: 'clamp(1.5rem, 3vw, 3rem)' }}>
        {/* Two Column Layout */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16"
        >
          {/* Left Column - Title and Images */}
          <div className="flex flex-col">
            {/* Title */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-8">
              Your Journey Starts Here
            </h2>

            {/* Image Gallery - Main Image + 3 Thumbnails */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4">
              {/* Main Image - Changes based on active step */}
              <div className="flex-1 relative rounded-2xl overflow-hidden bg-neutral-100 min-h-[280px] lg:min-h-[450px]">
                <img
                  key={currentStep.id}
                  src={currentStep.image}
                  alt={currentStep.title}
                  className="w-full h-full object-cover animate-fadeIn"
                  style={{ objectPosition: 'center' }}
                />
                {/* Gradient Overlay for better visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>

              {/* Thumbnail Images - Row on mobile, Column on desktop */}
              <div className="flex flex-row lg:flex-col justify-between gap-3 lg:gap-4 lg:w-28 lg:w-32 xl:w-36">
                {thumbnailSteps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className="relative rounded-xl overflow-hidden bg-neutral-100 flex-1 lg:flex-auto transition-all duration-300 hover:scale-105 hover:ring-2 hover:ring-neutral-300 animate-fadeIn h-20 lg:h-auto"
                    style={{ minHeight: '80px' }}
                  >
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full object-cover"
                      style={{ objectPosition: 'center' }}
                    />
                    {/* Subtle overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-300" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Steps */}
          <div className="flex flex-col justify-center">
            {/* Section Title */}
            <div className="mb-8">
              <p className="text-neutral-600 text-sm sm:text-base mb-2">
                How It Works
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900">
                Get on the road in just four easy steps
              </h3>
            </div>

            {/* Steps List */}
            <div className="space-y-5">
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = activeStep === step.id;

                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`
                    w-full text-left p-6 rounded-2xl transition-all duration-300
                    ${isActive
                        ? 'bg-[#E22B2B]'
                        : 'bg-white hover:bg-neutral-50'
                      }
                  `}
                  >
                    <div className="flex items-center gap-5">
                      {/* Icon */}
                      <div
                        className={`
                        flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center
                        transition-colors duration-300
                        ${isActive
                            ? 'bg-white/20'
                            : 'bg-neutral-100'
                          }
                      `}
                      >
                        <Icon
                          className={`
                          w-7 h-7 transition-colors duration-300
                          ${isActive ? 'text-white' : 'text-neutral-900'}
                        `}
                          strokeWidth={1.5}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`
                          text-lg sm:text-xl font-bold mb-2 transition-colors duration-300
                          ${isActive ? 'text-white' : 'text-neutral-900'}
                        `}
                        >
                          {step.title}
                        </h3>
                        <p
                          className={`
                          text-sm sm:text-base leading-relaxed transition-colors duration-300
                          ${isActive ? 'text-white/90' : 'text-neutral-600'}
                        `}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
