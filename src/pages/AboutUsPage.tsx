import { type FC, useState } from 'react';
import { ChevronDown } from 'lucide-react';

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

// Testimonials data
const testimonials = [
  {
    name: 'Alex Donovan',
    vehicle: 'Rented Mitsubishi Montero',
    rating: 5,
    quote: 'The Mitsubishi Montero was in perfect condition. The pickup process was incredibly smooth, and the staff at the airport desk were friendly and efficient.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9TEuZ1p9FdG_3J_lt2aIxzrQV8tu_HHBAMIfPmoA6ebx3YSVxmJEGHpn81v7EXpzWoTQwQlFcCfeLS_cqGlnHm_YEYQyemfDb-DpdKt5DjLJjtg87OZpcl9adWOTIRW3XOQZCwzuWV2-y8lCc_zBin6YWmK_5Mzhl3uAMIM7fM3-P23zw5bXVQmMz5jZgPsuYyRkDEhNrlHdhIX0AeFqQufx0SQrdX6iHE3la6IpoJLY7hMdzxrAok2gwVb20zH2B-M0CkH4YvdUy'
  },
  {
    name: 'Sarah Lewis',
    vehicle: 'Rented Toyota Corolla',
    rating: 4.5,
    quote: 'Best rates I found for a weekend getaway. The car was fuel-efficient and clean. I highly recommend AR Car Rentals for anyone visiting the coast.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDctw1GIG0vuix19oFbWSqAmLTbGcr3OLHf955P2Wjr9VbIEJ5K5_5gavDCGnnRIIvoLzX46d73_aDZzak2TZzkr4cA9O37WtJqdgR1g_viq5uZIx0Vjvae10kaVrXyhtsSH9xAkvO_O2m-CXoGSSosu8lWFD0ImJazY2mSbSv6nS-NoFvs_r5XNMAOfVJeTcoQ5_ViuncRkurNC6KStwqfWEcY0kWfk23DbGya6bjJhEnZgdeHiY5o1W3nX_s_l1VTFUyjr-g8Wcxw'
  },
  {
    name: 'Michael Brown',
    vehicle: 'Rented Ford Mustang',
    rating: 5,
    quote: 'Customer service was exceptional. They upgraded me for free when my original booking wasn\'t available. The Ford Mustang was a dream to drive!',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlVO2Yt0PIDcW4xnWTAUpcIhSiXBcGHTrYYg4J0nuSyCEsqj1j9eHMdL6h-vei2E2A0xzl4oR1bkcWgt6qtDBfEBFQsaKHsqn72p6m2cZDpe5XlDNy3MEtkg3kr7xV9Tzy_Nakz2adenkH0MgA26DsM647MM-Kcf3ZB5549fbmGKO4Et9pDSIJlxsQcYWmXTT6tNrsNyWaaociykvGklvN_57MavFypQ5jH3N0SL_Gm2cyrPj7HPeBqvNpJX-NS8J5cAVv_y2x5VrY'
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
      <section className="py-20 px-4 md:px-8 bg-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#E22B2B]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#E22B2B]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

        <div className="max-w-[1600px] mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 mb-4">
              What Our Customers Say
            </h2>
            {/* Decorative Underline */}
            <div className="w-24 h-1 bg-[#E22B2B] mx-auto rounded-full mb-4"></div>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Trusted by thousands of travelers worldwide for their journeys.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-4">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col h-full"
              >
                {/* Rating */}
                <div className="flex text-yellow-400 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(testimonial.rating) ? 'text-yellow-400' : i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {i < Math.floor(testimonial.rating) ? (
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      ) : i < testimonial.rating ? (
                        <path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4V6.1l1.71 5.24 5.49.47-4.18 3.62 1.25 5.37L12 17.77V15.4z" />
                      ) : (
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      )}
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-gray-600 mb-8 flex-grow leading-relaxed italic relative">
                  <span className="absolute -top-4 -left-2 text-6xl text-[#E22B2B]/10 font-serif leading-none">"</span>
                  {testimonial.quote}
                </p>

                {/* User Info */}
                <div className="flex items-center gap-4 mt-auto border-t border-gray-100 pt-6">
                  <div className="relative">
                    <img
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-[#E22B2B]/20"
                      src={testimonial.image}
                      alt={`Portrait of ${testimonial.name}`}
                    />
                    <div className="absolute -bottom-1 -right-1 bg-[#E22B2B] text-white rounded-full p-0.5">
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-neutral-900 text-sm">{testimonial.name}</h4>
                    <p className="text-[#E22B2B] text-xs font-semibold mt-0.5 uppercase tracking-wide">{testimonial.vehicle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="mt-16 pt-8 border-t border-gray-200 flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
              </svg>
              <span className="font-bold text-lg">TripAdvisor</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <span className="font-bold text-lg">Trustpilot</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
              </svg>
              <span className="font-bold text-lg">Google Reviews</span>
            </div>
          </div>
        </div>
      </section>

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

      {/* Fifth Section - CTA Banner */}
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
