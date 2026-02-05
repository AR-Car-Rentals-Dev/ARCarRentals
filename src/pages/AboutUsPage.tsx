import { type FC } from 'react';
import { ShieldCheck, Eye, Heart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';

/**
 * About Us Page - Company story, values, and vision
 */
export const AboutUsPage: FC = () => {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Hero Header */}
      <header className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/CCLEXOverlay.png"
            alt="Cebu scenic road"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-[1600px] mx-auto px-6 w-full">
          <div className="border-l-4 border-[#E22B2B] pl-6 md:pl-10">
            <h2 className="text-white uppercase tracking-[0.2em] text-sm md:text-base mb-4 font-semibold">
              Experience Cebu in Style
            </h2>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-[1.1]">
              Providing Premium<br />
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(135deg, #E22B2B 0%, #FB3030 100%)' }}
              >
                Mobility
              </span>
            </h1>
            <p className="text-neutral-200 text-lg md:text-2xl max-w-2xl font-light mb-10 leading-relaxed">
              Explore the Queen City of the South with uncompromised comfort, safety, and sophistication.
            </p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg
            className="w-6 h-6 text-white/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </header>

      {/* Our Story Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image Column */}
          <div className="relative group">
            <div className="relative z-10 rounded-xl overflow-hidden shadow-xl transition-all duration-700 hover:shadow-2xl transform group-hover:-translate-y-2">
              <img
                src="/carSectionImage.png"
                alt="Premium Fleet"
                className="w-full h-auto object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                <div className="border-l-2 border-[#E22B2B] pl-4">
                  <p className="font-bold text-white text-lg md:text-xl">Top-Tier Fleet</p>
                  <p className="text-neutral-300 text-sm mt-1">Meticulously maintained for excellence</p>
                </div>
              </div>
            </div>
            {/* Decorative corners */}
            <div className="absolute -top-4 -right-4 w-24 h-24 border-t-2 border-r-2 border-[#E22B2B]/30 rounded-tr-3xl"></div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 border-b-2 border-l-2 border-[#E22B2B]/30 rounded-bl-3xl"></div>
          </div>

          {/* Content Column */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-[#E22B2B]"></span>
              <h4 className="text-[#E22B2B] font-bold uppercase tracking-[0.2em] text-xs">Who We Are</h4>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-neutral-900 leading-tight">
              Driven by Passion,<br />
              <span className="italic font-light text-neutral-500">Focused on Service.</span>
            </h2>
            <div className="space-y-6 text-neutral-600 text-lg leading-relaxed">
              <p>
                AR Car Rentals was established with a singular, ambitious vision: to elevate the standard of mobility in Cebu City. We identified the need for a service that transcends mere transportation—offering reliability, transparency, and a touch of luxury.
              </p>
              <p>
                From a curated selection of vehicles to becoming one of Cebu's premier mobility partners, our growth is fueled by trust. We believe every rental is the beginning of a journey. Whether navigating urban avenues or coastal highways to Oslob, our fleet is your gateway to freedom.
              </p>
            </div>

            {/* Stats */}
            <div className="mt-10 pt-8 border-t border-neutral-200 flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-neutral-900">5,000+</div>
                <div className="text-sm text-neutral-500 uppercase tracking-wider mt-1">Travelers Trusted</div>
              </div>
              <div className="flex -space-x-3">
                <div className="w-12 h-12 rounded-full border-2 border-white bg-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-600">
                  5K+
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 px-6 bg-neutral-50">
        <div className="max-w-[1600px] mx-auto">
          <div className="text-center mb-16">
            <h4 className="text-[#E22B2B] font-bold uppercase tracking-[0.2em] text-xs mb-3">Our Philosophy</h4>
            <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">Core Values</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto text-lg">
              Principles that guide our every interaction, ensuring a seamless experience.
            </p>
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-2 transition-all duration-300 group border border-neutral-100">
              <div className="w-16 h-16 bg-[#E22B2B]/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck className="h-8 w-8 text-[#E22B2B]" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-neutral-900 group-hover:text-[#E22B2B] transition-colors">
                Unwavering Reliability
              </h3>
              <p className="text-neutral-600 leading-relaxed text-sm">
                Safety is non-negotiable. Rigorous maintenance protocols ensure that every vehicle is in pristine condition before you take the wheel.
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-2 transition-all duration-300 group border border-neutral-100">
              <div className="w-16 h-16 bg-[#E22B2B]/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Eye className="h-8 w-8 text-[#E22B2B]" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-neutral-900 group-hover:text-[#E22B2B] transition-colors">
                Total Transparency
              </h3>
              <p className="text-neutral-600 leading-relaxed text-sm">
                No hidden costs. No surprises. We build enduring relationships through honest pricing and clear, straightforward rental terms.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-2 transition-all duration-300 group border border-neutral-100">
              <div className="w-16 h-16 bg-[#E22B2B]/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Heart className="h-8 w-8 text-[#E22B2B]" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-neutral-900 group-hover:text-[#E22B2B] transition-colors">
                Customer Centricity
              </h3>
              <p className="text-neutral-600 leading-relaxed text-sm">
                Your journey is our priority. With 24/7 support and flexible options, we tailor our service to fit your unique travel itinerary.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Cebu Section */}
      <section className="py-20 px-6 bg-neutral-900 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('/CCLEXOverlay.png')] bg-cover bg-fixed bg-center"></div>

        <div className="max-w-[1600px] mx-auto relative z-10">
          <div className="mb-16">
            <h4 className="text-[#E22B2B] font-bold uppercase tracking-[0.2em] text-xs mb-3">The Destination</h4>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">Why We Love Cebu</h2>
            <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl">
              A province of endless possibilities. From pristine white sands to majestic falls, create your own itinerary and travel at your own pace.
            </p>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Large Image */}
            <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-lg h-96">
              <img
                src="/CCLEXOverlay.png"
                alt="Cebu beaches"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6">
                <span className="text-xs font-bold text-[#E22B2B] uppercase tracking-wider mb-2 block">
                  North Cebu
                </span>
                <h3 className="text-2xl font-bold">Pristine Beaches</h3>
              </div>
            </div>

            {/* Small Image 1 */}
            <div className="relative group overflow-hidden rounded-lg h-44 md:h-auto">
              <img
                src="/carSectionImage.png"
                alt="Scenic drives"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4">
                <h3 className="text-lg font-bold">Scenic Drives</h3>
              </div>
            </div>

            {/* Small Image 2 */}
            <div className="relative group overflow-hidden rounded-lg h-44 md:h-auto">
              <img
                src="/CCLEXOverlay.png"
                alt="City lights"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4">
                <h3 className="text-lg font-bold">City Life</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b border-neutral-200">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div className="group">
              <div className="text-5xl md:text-6xl font-black mb-4 text-neutral-900 relative inline-block">
                5+
                <div className="absolute bottom-1 left-0 w-full h-2 bg-[#E22B2B]/20 group-hover:bg-[#E22B2B] transition-colors"></div>
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-neutral-500">Years Excellence</div>
            </div>
            <div className="group">
              <div className="text-5xl md:text-6xl font-black mb-4 text-neutral-900 relative inline-block">
                50+
                <div className="absolute bottom-1 left-0 w-full h-2 bg-[#E22B2B]/20 group-hover:bg-[#E22B2B] transition-colors"></div>
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-neutral-500">Premium Vehicles</div>
            </div>
            <div className="group">
              <div className="text-5xl md:text-6xl font-black mb-4 text-neutral-900 relative inline-block">
                10k
                <div className="absolute bottom-1 left-0 w-full h-2 bg-[#E22B2B]/20 group-hover:bg-[#E22B2B] transition-colors"></div>
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-neutral-500">Happy Clients</div>
            </div>
            <div className="group">
              <div className="text-5xl md:text-6xl font-black mb-4 text-neutral-900 relative inline-block">
                24/7
                <div className="absolute bottom-1 left-0 w-full h-2 bg-[#E22B2B]/20 group-hover:bg-[#E22B2B] transition-colors"></div>
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-neutral-500">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-neutral-50">
        <div className="max-w-[1400px] mx-auto bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden relative">
          {/* Background Image */}
          <div className="absolute inset-0 bg-[url('/CCLEXOverlay.png')] bg-cover bg-center opacity-40"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>

          {/* Content */}
          <div className="flex flex-col md:flex-row items-center justify-between p-12 md:p-16 relative z-10 gap-10">
            <div className="md:max-w-xl">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to Explore?</h2>
              <p className="text-neutral-300 text-lg leading-relaxed">
                Don't let logistics limit your adventure. Secure your premium vehicle today and experience Cebu without boundaries.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button
                variant="primary"
                size="lg"
                onClick={() => (window.location.href = '/browsevehicles')}
                className="inline-flex items-center gap-3 bg-[#E22B2B] hover:bg-white hover:text-black text-white px-10 py-5 rounded-lg font-bold uppercase tracking-widest text-sm transition-all duration-300 shadow-xl"
              >
                Book Your Ride
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;
