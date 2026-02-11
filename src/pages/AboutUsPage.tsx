import { type FC, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AboutUsReviewsSection } from '@/components/sections/AboutUsReviewsSection';

// FAQ data
const faqs = [
  {
    question: 'How does it works?',
    answer: 'Booking with AR Car Rentals is simple: Browse our vehicles, select your dates and pickup location, complete the reservation form, and receive instant confirmation. On your pickup date, present a valid ID and driver\'s license, and you\'re ready to explore Cebu!'
  },
  {
    question: 'Can I rent a car without a credit card?',
    answer: 'Yes! We accept various payment methods including cash, bank transfers, and GCash. A valid government ID and driver\'s license are required for all rentals. Contact us for more details on our flexible payment options.'
  },
  {
    question: 'What are the requirements for renting a car?',
    answer: 'To rent with us, you need to be at least 21 years old, possess a valid driver\'s license (local or international), and provide a government-issued ID. For self-drive rentals, an LTO-verified license is required.'
  },
  {
    question: 'Does AR Car Rental allow me to tow with or attach a hitch to the rental vehicle?',
    answer: 'For safety and insurance reasons, towing or attaching hitches to our rental vehicles is not permitted. If you have specific transport needs, please contact our team to discuss alternative solutions.'
  },
  {
    question: 'Does AR Car Rental offer coverage products for purchase with my rental?',
    answer: 'Yes, all our rentals include basic insurance coverage. We also offer additional comprehensive coverage options for extra peace of mind during your trip. Our team can explain all coverage options during booking.'
  }
];

/**
 * About Us Page - Company story, values, and vision
 */
export const AboutUsPage: FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="bg-white">
      {/* First Section - Hero Image + 3 Column Content */}
      <section className="pt-8 pb-16 bg-white">
        <div className="mx-auto w-full max-w-[1600px]" style={{ paddingInline: 'clamp(1.5rem, 3vw, 3rem)' }}>
          {/* Hero Image - Centered with Rounded Corners */}
          <div className="mb-16">
            <img
              src="/aboutUsHero.png"
              alt="Professional car rental service in Cebu - Premium vehicle fleet"
              className="w-full h-[500px] object-cover rounded-[24px] shadow-lg"
            />
          </div>

          {/* 3 Column Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Column 1 - Title */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 leading-tight">
                Your journey starts with the perfect vehicle
              </h2>
            </div>

            {/* Column 2 - Features */}
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">Wide Selection of Vehicles</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  Choose from our extensive selection of premium vehicles featuring top automotive brands including Toyota, Mitsubishi, and Hyundai. Whether you need a sedan for corporate travel or an SUV for family getaways, we have the ideal vehicle for your Cebu adventure.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">Unlimited Mileage Options</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  Drive on your schedule with our flexible rental packages and generous mileage policies. From Oslob's whale shark watching to Moalboal's beaches, explore every corner of Cebu at your leisure without restrictions or kilometer limits.
                </p>
              </div>
            </div>

            {/* Column 3 - More Features */}
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">24/7 Customer Assistance</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  Benefit from round-the-clock roadside assistance and customer care during your entire rental period. Our responsive support team is always ready to help, ensuring safe and stress-free travels throughout Cebu and beyond.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">Easy Booking Management</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  Adjust your rental schedule, switch vehicles, or extend your booking effortlessly through our user-friendly system. We accommodate last-minute changes and provide flexible policies that work around your travel needs without additional hassle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Second Section - Why Choose Us (Two Column with Slant Design) */}
      <section className="relative py-20 lg:py-28 overflow-hidden bg-[#f8f5f5]">
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#E22B2B]/5 -skew-x-12 transform origin-top translate-x-1/2 z-0 hidden lg:block"></div>

        <div className="mx-auto w-full max-w-[1600px] relative z-10" style={{ paddingInline: 'clamp(1.5rem, 3vw, 3rem)' }}>
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Left Column: Image with Red Accent */}
            <div className="w-full lg:w-1/2 relative group">
              {/* Red Accent Slant Behind */}
              <div className="absolute -top-4 -left-4 w-full h-full bg-[#E22B2B] rounded-xl -skew-x-6 transform transition-transform duration-500 group-hover:-skew-x-3 group-hover:-translate-y-1"></div>

              {/* Main Image Container */}
              <div className="relative w-full h-[400px] lg:h-[500px] rounded-xl overflow-hidden shadow-2xl bg-gray-200">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgvyNseQTn2MyBASe1RJmOBGKihG5YPz9mvEfehnIbHKftyCzWkuns6WpJrsKuAk-ktTtOJ_uNPuaG_cKW9xhsuLNYwVGtGNGyh7SX0mGiOe4creX4IjykVV3tRCX5OzwPdO2_8MXxv5PpCjw3kBcmLZ06gGT-gXI0Yd9dzYhrcOgEmEJznDO9k5JaMPdCHsK9uDIXXSRdFBEYb6GhmCjPAoWQYLycomFyqvZfbTpKxB05t20b2I3DR9r7tziEqqQF-j4spTwxJJfg"
                  alt="Luxury car parked in front of modern glass office building"
                  className="w-full h-full object-cover object-center transform transition-transform duration-700 hover:scale-105"
                />
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>

                {/* Floating Badge */}
                <div className="absolute bottom-6 left-6 bg-white p-4 rounded-lg shadow-lg border-l-4 border-[#E22B2B]">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Experience</p>
                  <p className="text-2xl font-bold text-gray-900">15+ <span className="text-[#E22B2B]">Years</span></p>
                </div>
              </div>
            </div>

            {/* Right Column: Content */}
            <div className="w-full lg:w-1/2 space-y-8">
              <div className="space-y-4">
                {/* Section Tag */}
                <div className="flex items-center gap-2">
                  <span className="h-0.5 w-8 bg-[#E22B2B]"></span>
                  <span className="text-[#E22B2B] font-bold uppercase tracking-widest text-sm">Why Choose Us</span>
                </div>

                {/* Title */}
                <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight text-neutral-900">
                  Providing <span className="text-[#E22B2B] relative inline-block">
                    Quality
                    <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#E22B2B] opacity-30" preserveAspectRatio="none" viewBox="0 0 100 10">
                      <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="8"></path>
                    </svg>
                  </span> and Affordable Car Rental Services
                </h2>

                {/* Description */}
                <p className="text-gray-600 text-lg leading-relaxed">
                  At AR Car Rentals, we believe the journey is just as important as the destination. We bridge the gap between luxury and affordability, ensuring that whether you're traveling for business or pleasure, you drive with confidence. Our modern fleet is meticulously maintained to provide safety, comfort, and style on every mile.
                </p>
              </div>

              {/* Trust Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {/* Pillar 1 - Trusted & Reliable */}
                <div className="flex flex-col items-start p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="w-12 h-12 rounded-full bg-[#E22B2B]/10 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-[#E22B2B]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-neutral-900 text-lg">Trusted & Reliable</h3>
                  <p className="text-sm text-gray-500 mt-1">Top-rated service backed by thousands of happy clients.</p>
                </div>

                {/* Pillar 2 - 24/7 Support */}
                <div className="flex flex-col items-start p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="w-12 h-12 rounded-full bg-[#E22B2B]/10 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-[#E22B2B]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-neutral-900 text-lg">24/7 Support</h3>
                  <p className="text-sm text-gray-500 mt-1">Our dedicated team is ready to assist you anytime, anywhere.</p>
                </div>

                {/* Pillar 3 - Affordable Rates */}
                <div className="flex flex-col items-start p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="w-12 h-12 rounded-full bg-[#E22B2B]/10 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-[#E22B2B]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-neutral-900 text-lg">Affordable Rates</h3>
                  <p className="text-sm text-gray-500 mt-1">Premium vehicles at competitive market prices.</p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <a
                  href="/browsevehicles"
                  className="group relative inline-flex items-center gap-2 px-8 py-3 bg-[#E22B2B] text-white font-bold rounded-lg overflow-hidden shadow-lg hover:shadow-[#E22B2B]/40 transition-all duration-300"
                >
                  <span className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                  <span className="relative flex items-center gap-2">
                    Discover Our Fleet
                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Fourth Section - Customer Reviews */}
      <AboutUsReviewsSection />

      {/* Fifth Section - FAQs */}
      <section className="py-20 bg-white">
        <div className="mx-auto w-full max-w-[1600px]" style={{ paddingInline: 'clamp(1.5rem, 3vw, 3rem)' }}>
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">
              Top Car Rental Questions
            </h2>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-neutral-200 rounded-xl overflow-hidden bg-white"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-neutral-50 transition-colors"
                >
                  <span className="font-semibold text-neutral-900">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-neutral-500 transition-transform duration-200 ${openFaq === index ? 'rotate-180' : ''
                      }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-96' : 'max-h-0'
                    }`}
                >
                  <div className="px-6 pb-4">
                    <p className="text-neutral-600 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sixth Section - CTA Banner */}
      <section className="py-20 bg-neutral-50">
        <div className="mx-auto w-full max-w-[1600px]" style={{ paddingInline: 'clamp(1.5rem, 3vw, 3rem)' }}>
          <div className="bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden relative">
            {/* Background Image - Using a different scenic image */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1400&q=80')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>

            {/* Content */}
            <div className="flex flex-col md:flex-row items-center justify-between p-12 md:p-16 relative z-10 gap-10">
              <div className="md:max-w-xl">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Start Your Journey Today</h2>
                <p className="text-neutral-300 text-lg leading-relaxed">
                  Ready to explore Cebu's stunning beaches, majestic mountains, and vibrant cities? Book your rental car now and create unforgettable memories.
                </p>
              </div>
              <div className="flex-shrink-0">
                <a
                  href="/browsevehicles"
                  className="inline-flex items-center gap-3 bg-[#E22B2B] hover:bg-white hover:text-black text-white px-10 py-5 rounded-lg font-bold uppercase tracking-widest text-sm transition-all duration-300 shadow-xl"
                >
                  Browse Cars
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;
