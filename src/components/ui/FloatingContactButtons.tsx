import { useState } from 'react';
import type { FC } from 'react';
import { MessageCircle, X } from 'lucide-react';

// Contact links
const CONTACT_LINKS = {
  viber: 'viber://chat?number=%2B639423943545', // +63 942 394 3545
  whatsapp: 'https://api.whatsapp.com/send/?phone=639423943545&text&type=phone_number&app_absent=0', // +63 942 394 3545
  facebook: 'https://www.facebook.com/arcarrentalsservicescebu', // AR Car Rentals Facebook page
};

/**
 * Floating contact action buttons for Viber, WhatsApp, and Facebook
 * Displays at bottom-right of screen
 */
export const FloatingContactButtons: FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Expanded buttons */}
      <div
        className={`flex flex-col gap-3 transition-all duration-300 ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Viber */}
        <a
          href={CONTACT_LINKS.viber}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2"
          title="Chat on Viber"
        >
          <span className="bg-white px-3 py-1.5 rounded-lg shadow-md text-sm font-medium text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity">
            Viber
          </span>
          <div className="w-12 h-12 rounded-full bg-[#7360F2] hover:bg-[#5e4dd1] shadow-lg flex items-center justify-center transition-all hover:scale-110 overflow-hidden">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white flex-shrink-0">
              <path d="M12.031 1.003c-5.395-.065-10.09 3.682-10.945 9.152-.497 3.18.315 6.086 2.085 8.375l-1.163 3.468 3.606-1.137c2.008 1.162 4.379 1.715 6.913 1.391 5.395-.687 9.509-5.442 9.469-10.97-.04-5.413-4.551-10.214-9.965-10.279zm5.936 14.726c-.261.739-1.548 1.419-2.158 1.461-.609.042-1.156.289-3.818-.797-3.22-1.313-5.251-4.639-5.41-4.855-.159-.215-1.29-1.717-1.29-3.276 0-1.558.82-2.323 1.108-2.64.289-.317.631-.395.841-.395.21 0 .42 0 .604.011.21.011.482-.075.754.576.273.652.924 2.265 1.008 2.429.084.163.14.357.028.572-.112.215-.168.348-.337.537-.168.189-.353.42-.504.562-.168.159-.345.331-.148.649.196.317.873 1.439 1.875 2.331 1.289 1.148 2.373 1.504 2.71 1.672.337.168.533.14.729-.084.196-.224.84-.978 1.064-1.316.224-.337.449-.28.757-.168.308.112 1.959.924 2.295 1.092.337.168.561.252.646.392.084.14.084.812-.177 1.551z" />
            </svg>
          </div>
        </a>

        {/* WhatsApp */}
        <a
          href={CONTACT_LINKS.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2"
          title="Chat on WhatsApp"
        >
          <span className="bg-white px-3 py-1.5 rounded-lg shadow-md text-sm font-medium text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity">
            WhatsApp
          </span>
          <div className="w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#1fb855] shadow-lg flex items-center justify-center transition-all hover:scale-110 overflow-hidden">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white flex-shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
        </a>

        {/* Facebook */}
        <a
          href={CONTACT_LINKS.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2"
          title="Visit Facebook Page"
        >
          <span className="bg-white px-3 py-1.5 rounded-lg shadow-md text-sm font-medium text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity">
            Facebook
          </span>
          <div className="w-12 h-12 rounded-full bg-[#1877F2] hover:bg-[#166fe5] shadow-lg flex items-center justify-center transition-all hover:scale-110 overflow-hidden">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white flex-shrink-0">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>
        </a>
      </div>

      {/* Main toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? 'bg-neutral-800 hover:bg-neutral-700 rotate-0'
            : 'bg-[#E22B2B] hover:bg-[#c92525]'
        }`}
        aria-label={isOpen ? 'Close contact menu' : 'Open contact menu'}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
};

export default FloatingContactButtons;
