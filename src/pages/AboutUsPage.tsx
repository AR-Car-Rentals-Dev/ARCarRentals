import { type FC, useState } from 'react';
import { CheckCircle2, ChevronDown } from 'lucide-react';

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
    initials: 'RJ',
    name: 'Rob Jones',
    company: 'Travel Blogger',
    quote: 'Amazing service! The Toyota Innova was spotless and perfect for our family trip to Oslob. The booking process was seamless, and the staff was incredibly helpful throughout our journey.'
  },
  {
    initials: 'SC',
    name: 'Sofia Cruz',
    company: 'Cebu Tours Co.',
    quote: 'Best car rental in Cebu! Transparent pricing with no hidden fees, and the Fortuner was in excellent condition. The 24/7 support gave us peace of mind during our entire trip.'
  },
  {
    initials: 'ML',
    name: 'Mark Lee',
    company: 'Business Traveler',
    quote: 'Highly recommend AR Car Rentals! Professional service from start to finish. The vehicle was delivered on time, and the flexible rental terms made planning our Cebu adventure stress-free.'
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
      {/* Header - Centered */}
      <div className="pt-12 pb-6 text-center">
        <h1 className="text-4xl font-bold text-neutral-900 mb-3">ABOUT US</h1>
        <p className="text-sm">
          <span className="text-neutral-500">Home</span>
          <span className="text-neutral-400 mx-2">/</span>
          <span className="text-neutral-900">About Us</span>
        </p>
      </div>

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

      {/* Second Section - Two Column: Content + Image */}
      <section className="py-20 bg-white">
        <div className="mx-auto w-full max-w-[1600px] grid grid-cols-1 lg:grid-cols-2 gap-16 items-center" style={{ paddingInline: 'clamp(1.5rem, 3vw, 3rem)' }}>
          {/* Left Column - Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6 leading-tight">
              Experience seamless<br />
              travel across Cebu
            </h2>
            <p className="text-neutral-600 text-base leading-relaxed mb-8">
              With AR Car Rentals, every rental is more than just transportation—it's your passport to incredible experiences. We deliver dependable vehicles, transparent service, and the independence you need to make the most of your Cebu journey.
            </p>

            {/* Feature List with Check Icons - 2 Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#E22B2B] flex-shrink-0 mt-0.5" />
                <p className="text-neutral-700 text-sm">
                  <strong>Fully Comprehensive Insurance:</strong> Every rental includes complete insurance coverage, protecting you and your loved ones throughout your entire journey.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#E22B2B] flex-shrink-0 mt-0.5" />
                <p className="text-neutral-700 text-sm">
                  <strong>Premium Quality Interiors:</strong> All vehicles feature luxurious interiors with modern amenities and spotless cabins for ultimate comfort.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#E22B2B] flex-shrink-0 mt-0.5" />
                <p className="text-neutral-700 text-sm">
                  <strong>Transparent Pricing Policy:</strong> See your complete rental cost upfront with zero hidden fees or surprise charges.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#E22B2B] flex-shrink-0 mt-0.5" />
                <p className="text-neutral-700 text-sm">
                  <strong>Years of Trusted Service:</strong> Benefit from our extensive experience serving thousands of satisfied travelers across Cebu.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative">
            <div className="relative rounded-[24px] overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&q=80"
                alt="Premium car rental experience - Luxury vehicles in Cebu"
                className="w-full h-[500px] object-cover"
              />
              {/* Gradient overlay for better text contrast if needed */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Third Section - Testimonials/Reviews */}
      <section className="py-20 bg-neutral-50">
        <div className="mx-auto w-full max-w-[1600px]" style={{ paddingInline: 'clamp(1.5rem, 3vw, 3rem)' }}>
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Trusted by 500+ Travelers
            </h2>
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-[#FFC107]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-neutral-600 font-medium">5.0 Overall rating</span>
            </div>
          </div>

          {/* Testimonials Grid - New Card Design */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 relative border-t-4 border-[#E22B2B]"
              >
                {/* Quote Icon */}
                <div className="mb-4">
                  <svg className="w-8 h-8 text-[#E22B2B]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>

                {/* Quote Text */}
                <p className="text-neutral-600 text-sm leading-relaxed mb-8 italic">
                  "{testimonial.quote}"
                </p>

                {/* Author - Bottom aligned */}
                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-neutral-100">
                  <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center overflow-hidden">
                    <span className="text-neutral-700 font-bold text-sm">{testimonial.initials}</span>
                  </div>
                  <div>
                    <p className="text-xs text-[#E22B2B] font-medium">{testimonial.company}</p>
                    <h4 className="font-bold text-neutral-900">{testimonial.name}</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fourth Section - FAQs */}
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
