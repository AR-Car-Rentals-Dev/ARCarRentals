import { type FC } from 'react';
import { ArrowRight, Car, CreditCard, ShieldCheck, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { SEO } from '@/components/SEO';
import { generateWebPageSchema, generateBreadcrumbSchema, generateFAQSchema, combineSchemas } from '@/utils/seoSchemas';

/**
 * How to Rent Page - Simple 4-step guide to renting a car
 */
export const HowToRentPage: FC = () => {
  // SEO structured data
  const structuredData = combineSchemas([
    generateWebPageSchema({
      url: 'https://arcarrentalscebu.com/how-to-rent',
      name: 'How to Rent - AR Car Rentals',
      description: 'Learn how to rent a car from AR Car Rentals in 4 easy steps. Browse vehicles, book online, verify your booking, and pick up your car in Cebu.',
    }),
    generateBreadcrumbSchema([
      { name: 'Home', url: 'https://arcarrentalscebu.com' },
      { name: 'How to Rent', url: 'https://arcarrentalscebu.com/how-to-rent' },
    ]),
    generateFAQSchema([
      {
        question: 'Do I need to pay a security deposit?',
        answer: 'Yes, a refundable security deposit is required upon vehicle pickup. This will be returned to you when the vehicle is returned in the same condition.',
      },
      {
        question: 'Is fuel included in the rental?',
        answer: 'Vehicles are provided with a full tank of fuel and must be returned with a full tank. Otherwise, refueling charges will apply.',
      },
      {
        question: 'Can I drive the car outside of Cebu City?',
        answer: 'Yes, you can drive anywhere within the island of Cebu. If you plan to take the vehicle via RORO to neighboring islands, prior approval is required.',
      },
      {
        question: 'What if I return the car late?',
        answer: 'Late returns are subject to additional charges based on our hourly or daily rates. Please contact us if you need to extend your rental period.',
      },
    ]),
  ]);

  return (
    <>
      <SEO
        title="How to Rent"
        description="Rent a car in Cebu in 4 easy steps with AR Car Rentals. Browse vehicles, book online, verify your details, and pick up your car. Simple, fast, and hassle-free car rental process."
        keywords={[
          'how to rent car Cebu',
          'car rental process',
          'rent a car steps',
          'booking guide',
          'car rental Cebu',
          'rental requirements',
          'vehicle pickup',
          'easy car rental',
        ]}
        canonical="https://arcarrentalscebu.com/how-to-rent"
        structuredData={structuredData}
      />
      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Hero Header */}
      <header className="relative bg-gradient-to-br from-neutral-900 to-neutral-800 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="/CCLEXOverlay.png"
            alt="Scenic road"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-[1600px] mx-auto px-6 py-20 md:py-28 text-center">
          <span className="inline-block text-[#E22B2B] font-bold tracking-wider mb-3 uppercase text-sm">
            Start your adventure
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Simple Steps to Your <br />
            <span className="text-[#E22B2B]">Next Journey</span>
          </h1>
          <p className="text-neutral-300 text-lg md:text-xl max-w-2xl mx-auto">
            Renting a car in Cebu has never been easier. Follow our simple guide to get on the road in no time.
          </p>
        </div>
      </header>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-900">How It Works</h2>
            <div className="w-20 h-1 bg-[#E22B2B] mx-auto rounded-full"></div>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connection Line (desktop only) */}
            <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-neutral-200 z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mb-6 border-4 border-white group-hover:border-[#E22B2B] transition-all duration-300">
                <Car className="h-10 w-10 text-[#E22B2B]" strokeWidth={1.5} />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm w-full border border-neutral-100 hover:shadow-md transition-all duration-300">
                <span className="inline-block px-3 py-1 bg-[#E22B2B]/10 text-[#E22B2B] rounded-full text-sm font-bold mb-3">
                  Step 01
                </span>
                <h3 className="text-xl font-bold mb-3 text-neutral-900">Browse & Choose</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  Explore our wide range of vehicles. Select the perfect car that fits your travel needs and budget.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mb-6 border-4 border-white group-hover:border-[#E22B2B] transition-all duration-300">
                <CreditCard className="h-10 w-10 text-[#E22B2B]" strokeWidth={1.5} />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm w-full border border-neutral-100 hover:shadow-md transition-all duration-300">
                <span className="inline-block px-3 py-1 bg-[#E22B2B]/10 text-[#E22B2B] rounded-full text-sm font-bold mb-3">
                  Step 02
                </span>
                <h3 className="text-xl font-bold mb-3 text-neutral-900">Book & Pay</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  Submit your booking details and make a secure payment to reserve your chosen vehicle instantly.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mb-6 border-4 border-white group-hover:border-[#E22B2B] transition-all duration-300">
                <ShieldCheck className="h-10 w-10 text-[#E22B2B]" strokeWidth={1.5} />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm w-full border border-neutral-100 hover:shadow-md transition-all duration-300">
                <span className="inline-block px-3 py-1 bg-[#E22B2B]/10 text-[#E22B2B] rounded-full text-sm font-bold mb-3">
                  Step 03
                </span>
                <h3 className="text-xl font-bold mb-3 text-neutral-900">Verification</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  Our team performs a quick review of your documents. Approval is fast, usually within minutes.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mb-6 border-4 border-white group-hover:border-[#E22B2B] transition-all duration-300">
                <CheckCircle className="h-10 w-10 text-[#E22B2B]" strokeWidth={1.5} />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm w-full border border-neutral-100 hover:shadow-md transition-all duration-300">
                <span className="inline-block px-3 py-1 bg-[#E22B2B]/10 text-[#E22B2B] rounded-full text-sm font-bold mb-3">
                  Step 04
                </span>
                <h3 className="text-xl font-bold mb-3 text-neutral-900">Drive Away</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  Pick up your car or have it delivered. Enjoy your trip around Cebu with peace of mind.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-12 text-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => (window.location.href = '/browsevehicles')}
              className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-[#E22B2B] text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300"
            >
              <span>Start Your Booking</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* What You Need Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left Column - Content */}
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-neutral-900">What You Need</h2>
              <p className="text-neutral-600 mb-10 text-lg leading-relaxed">
                To ensure a smooth rental process, please have the following documents ready when you book or pick up your vehicle. We keep the paperwork minimal.
              </p>

              {/* Requirements */}
              <div className="space-y-6">
                {/* Valid Government ID */}
                <div className="flex items-start p-5 rounded-xl bg-neutral-50 border border-neutral-100 hover:border-[#E22B2B]/30 transition-all">
                  <div className="flex-shrink-0 bg-[#E22B2B]/10 rounded-full p-3 mr-4">
                    <ShieldCheck className="h-6 w-6 text-[#E22B2B]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-neutral-900 mb-1">Valid Government ID</h4>
                    <p className="text-sm text-neutral-600">
                      Passport or any government-issued ID for identity verification.
                    </p>
                  </div>
                </div>

                {/* Driver's License */}
                <div className="flex items-start p-5 rounded-xl bg-neutral-50 border border-neutral-100 hover:border-[#E22B2B]/30 transition-all">
                  <div className="flex-shrink-0 bg-[#E22B2B]/10 rounded-full p-3 mr-4">
                    <Car className="h-6 w-6 text-[#E22B2B]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-neutral-900 mb-1">Driver's License</h4>
                    <p className="text-sm text-neutral-600">
                      A valid professional or non-professional driver's license.
                    </p>
                  </div>
                </div>

                {/* Proof of Payment */}
                <div className="flex items-start p-5 rounded-xl bg-neutral-50 border border-neutral-100 hover:border-[#E22B2B]/30 transition-all">
                  <div className="flex-shrink-0 bg-[#E22B2B]/10 rounded-full p-3 mr-4">
                    <CreditCard className="h-6 w-6 text-[#E22B2B]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-neutral-900 mb-1">Proof of Payment</h4>
                    <p className="text-sm text-neutral-600">
                      Screenshot or digital copy of your downpayment or full payment.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="lg:w-1/2 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/carSectionImage.png"
                  alt="Car rental key handover"
                  className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                />
                {/* Testimonial Overlay */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-lg border-l-4 border-[#E22B2B]">
                  <p className="text-neutral-900 font-medium italic text-sm md:text-base">
                    "Great service! The process was incredibly fast and the car was in perfect condition for our Cebu tour."
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="text-yellow-500 text-sm">★★★★★</div>
                    <span className="text-neutral-600 text-xs uppercase font-bold tracking-widest">
                      - Happy Customer
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-neutral-50">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-neutral-900">Frequently Asked Questions</h2>
            <p className="text-neutral-600">Got questions? We've got answers.</p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {/* FAQ 1 */}
            <details className="group bg-white rounded-lg overflow-hidden shadow-sm border border-neutral-100">
              <summary className="flex justify-between items-center p-6 cursor-pointer font-bold text-lg text-neutral-900 list-none focus:outline-none">
                Do I need to pay a security deposit?
                <span className="transition-transform group-open:rotate-180">
                  <svg className="h-6 w-6 text-[#E22B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <p className="px-6 pb-6 text-neutral-600 leading-relaxed">
                Yes, a refundable security deposit is required upon vehicle pickup. This will be returned to you when the vehicle is returned in the same condition.
              </p>
            </details>

            {/* FAQ 2 */}
            <details className="group bg-white rounded-lg overflow-hidden shadow-sm border border-neutral-100">
              <summary className="flex justify-between items-center p-6 cursor-pointer font-bold text-lg text-neutral-900 list-none focus:outline-none">
                Is fuel included in the rental?
                <span className="transition-transform group-open:rotate-180">
                  <svg className="h-6 w-6 text-[#E22B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <p className="px-6 pb-6 text-neutral-600 leading-relaxed">
                Vehicles are provided with a full tank of fuel and must be returned with a full tank. Otherwise, refueling charges will apply.
              </p>
            </details>

            {/* FAQ 3 */}
            <details className="group bg-white rounded-lg overflow-hidden shadow-sm border border-neutral-100">
              <summary className="flex justify-between items-center p-6 cursor-pointer font-bold text-lg text-neutral-900 list-none focus:outline-none">
                Can I drive the car outside of Cebu City?
                <span className="transition-transform group-open:rotate-180">
                  <svg className="h-6 w-6 text-[#E22B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <p className="px-6 pb-6 text-neutral-600 leading-relaxed">
                Yes, you can drive anywhere within the island of Cebu. If you plan to take the vehicle via RORO to neighboring islands, prior approval is required.
              </p>
            </details>

            {/* FAQ 4 */}
            <details className="group bg-white rounded-lg overflow-hidden shadow-sm border border-neutral-100">
              <summary className="flex justify-between items-center p-6 cursor-pointer font-bold text-lg text-neutral-900 list-none focus:outline-none">
                What if I return the car late?
                <span className="transition-transform group-open:rotate-180">
                  <svg className="h-6 w-6 text-[#E22B2B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <p className="px-6 pb-6 text-neutral-600 leading-relaxed">
                We offer a 1-hour grace period. Beyond that, hourly charges apply. If the delay exceeds 5 hours, a full day's rental fee will be charged.
              </p>
            </details>
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
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">You Know the Process—Let's Begin!</h2>
              <p className="text-neutral-300 text-lg leading-relaxed">
                Now that you understand how simple it is, choose your vehicle and start your Cebu journey. Your adventure awaits.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button
                variant="primary"
                size="lg"
                onClick={() => (window.location.href = '/browsevehicles')}
                className="inline-flex items-center gap-3 bg-[#E22B2B] hover:bg-white hover:text-black text-white px-10 py-5 rounded-lg font-bold uppercase tracking-widest text-sm transition-all duration-300 shadow-xl"
              >
                Start Booking
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  );
};

export default HowToRentPage;
