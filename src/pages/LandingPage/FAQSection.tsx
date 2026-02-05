import { type FC, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    id: '1',
    question: 'What are the requirements for self-drive?',
    answer: "For self-drive rentals, you'll need a valid driver's license (local or international), a valid government-issued ID, and a security deposit. You must be at least 21 years old with a minimum of 2 years driving experience.",
  },
  {
    id: '2',
    question: 'Is fuel included in the rental rate?',
    answer: 'Our rental rates do not include fuel. Vehicles are provided with a full tank, and we ask that you return them with a full tank as well. If returned with less fuel, a refueling fee will apply.',
  },
  {
    id: '3',
    question: 'Can you deliver the car to the airport?',
    answer: 'Yes! We offer airport pickup and delivery services at Mactan-Cebu International Airport. Please book at least 24 hours in advance and provide your flight details for seamless coordination.',
  },
];

/**
 * FAQ Section with accordion
 */
export const FAQSection: FC = () => {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section 
      className="bg-[#F0F0F0] flex flex-col justify-center py-10 sm:py-16"
      style={{ 
        minHeight: '400px',
        fontFamily: "'Plus Jakarta Sans', sans-serif" 
      }}
    >
      <div className="mx-auto w-full max-w-[1600px]" style={{ paddingInline: 'clamp(1.5rem, 3vw, 3rem)' }}>
        {/* Section Header */}
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-6 sm:mb-8 text-center">
          Frequently Asked Questions
        </h2>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq) => (
            <div 
              key={faq.id}
              className="bg-white rounded-lg border border-neutral-200 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full flex items-center justify-between p-3 sm:p-4 text-left hover:bg-neutral-50 transition-colors"
              >
                <span className="font-medium text-neutral-900 text-xs sm:text-sm pr-4">
                  {faq.question}
                </span>
                <ChevronDown 
                  className={`h-5 w-5 text-neutral-400 transition-transform duration-200 flex-shrink-0 ${
                    openId === faq.id ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              {/* Answer (collapsible) */}
              <div 
                className={`overflow-hidden transition-all duration-200 ${
                  openId === faq.id ? 'max-h-48' : 'max-h-0'
                }`}
              >
                <div className="px-3 sm:px-4 pb-3 sm:pb-4 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
