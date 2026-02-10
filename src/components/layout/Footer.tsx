import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Linkedin } from 'lucide-react';
import { config } from '@utils/config';

// Custom Viber icon
const ViberIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
    <path d="M12.031 1.003c-5.395-.065-10.09 3.682-10.945 9.152-.497 3.18.315 6.086 2.085 8.375l-1.163 3.468 3.606-1.137c2.008 1.162 4.379 1.715 6.913 1.391 5.395-.687 9.509-5.442 9.469-10.97-.04-5.413-4.551-10.214-9.965-10.279zm5.936 14.726c-.261.739-1.548 1.419-2.158 1.461-.609.042-1.156.289-3.818-.797-3.22-1.313-5.251-4.639-5.41-4.855-.159-.215-1.29-1.717-1.29-3.276 0-1.558.82-2.323 1.108-2.64.289-.317.631-.395.841-.395.21 0 .42 0 .604.011.21.011.482-.075.754.576.273.652.924 2.265 1.008 2.429.084.163.14.357.028.572-.112.215-.168.348-.337.537-.168.189-.353.42-.504.562-.168.159-.345.331-.148.649.196.317.873 1.439 1.875 2.331 1.289 1.148 2.373 1.504 2.71 1.672.337.168.533.14.729-.084.196-.224.84-.978 1.064-1.316.224-.337.449-.28.757-.168.308.112 1.959.924 2.295 1.092.337.168.561.252.646.392.084.14.084.812-.177 1.551z" />
  </svg>
);

// Custom WhatsApp icon
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

/**
 * Footer component - Redesigned with multi-column layout and embedded map
 */
export const Footer: FC = () => {
  const currentYear = new Date().getFullYear();

  // Footer navigation links
  const footerLinks = {
    about: [
      { label: 'About Us', href: '/aboutus' },
      { label: 'Our Fleet', href: '/browsevehicles' },
      { label: 'Locations', href: '/contact' },
      { label: 'Reviews', href: '/aboutus#reviews' },
    ],
    menu: [
      { label: 'Home', href: '/' },
      { label: 'Fleet', href: '/browsevehicles' },
      { label: 'Services', href: '/aboutus' },
      { label: 'Contact', href: '/contact' },
    ],
    services: [
      { label: 'Self-Drive Rental', href: '/browsevehicles' },
      { label: 'With Driver', href: '/browsevehicles' },
      { label: 'Airport Pickup', href: '/contact' },
      { label: 'Tour Packages', href: '/aboutus' },
    ],
  };

  return (
    <footer style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }} className="relative z-10 overflow-hidden">
      {/* Main Footer Content */}
      <div className="bg-neutral-900 py-12 lg:py-16 relative z-10">
        <div className="mx-auto w-full max-w-[1600px]" style={{ paddingInline: 'clamp(1.5rem, 3vw, 3rem)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">

            {/* Brand Column */}
            <div className="lg:col-span-2">
              {/* Logo */}
              <Link to="/" className="inline-block mb-4">
                <img
                  src="/ARCarRentals.png"
                  alt="AR Car Rentals Logo"
                  className="h-24 w-auto object-contain"
                />
              </Link>

              {/* Slogan */}
              <p className="text-[#E22B2B] font-semibold text-sm mb-4">
                Your Trusted Car Rental Partner
              </p>

              {/* Description */}
              <p className="text-neutral-400 text-sm mb-6 max-w-xs leading-relaxed">
                Providing quality and affordable car rental services in Cebu City since 2010. Experience comfort, reliability, and exceptional service.
              </p>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                <a
                  href="https://www.facebook.com/arcarrentalsservicescebu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-neutral-600 flex items-center justify-center text-neutral-400 hover:bg-[#E22B2B] hover:border-[#E22B2B] hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href="https://www.linkedin.com/in/ar-car-rentals-tour-services-cebu-9674693aa/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-neutral-600 flex items-center justify-center text-neutral-400 hover:bg-[#E22B2B] hover:border-[#E22B2B] hover:text-white transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a
                  href="viber://chat?number=%2B639423943545"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-neutral-600 flex items-center justify-center text-neutral-400 hover:bg-[#E22B2B] hover:border-[#E22B2B] hover:text-white transition-colors"
                  aria-label="Viber"
                >
                  <ViberIcon />
                </a>
                <a
                  href="https://api.whatsapp.com/send/?phone=639423943545&text&type=phone_number&app_absent=0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-neutral-600 flex items-center justify-center text-neutral-400 hover:bg-[#E22B2B] hover:border-[#E22B2B] hover:text-white transition-colors"
                  aria-label="WhatsApp"
                >
                  <WhatsAppIcon />
                </a>
              </div>
            </div>

            {/* About Links */}
            <div>
              <h3 className="font-bold text-white mb-4">About</h3>
              <ul className="space-y-3">
                {footerLinks.about.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-neutral-400 hover:text-[#E22B2B] transition-colors text-sm flex items-center gap-2"
                    >
                      <span className="text-[#E22B2B]">›</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Menu Links */}
            <div>
              <h3 className="font-bold text-white mb-4">Menu</h3>
              <ul className="space-y-3">
                {footerLinks.menu.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-neutral-400 hover:text-[#E22B2B] transition-colors text-sm flex items-center gap-2"
                    >
                      <span className="text-[#E22B2B]">›</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services Links */}
            <div>
              <h3 className="font-bold text-white mb-4">Services</h3>
              <ul className="space-y-3">
                {footerLinks.services.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-neutral-400 hover:text-[#E22B2B] transition-colors text-sm flex items-center gap-2"
                    >
                      <span className="text-[#E22B2B]">›</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact + Map */}
            <div className="lg:col-span-1">
              <h3 className="font-bold text-white mb-4">Contact</h3>
              <ul className="space-y-3 mb-4">
                <li className="text-sm">
                  <span className="text-white font-medium">Call:</span>
                  <br />
                  <a href={`tel:${config.contact.phone.replace(/\s/g, '')}`} className="text-neutral-400 hover:text-[#E22B2B] transition-colors">
                    {config.contact.phone}
                  </a>
                </li>
                <li className="text-sm">
                  <span className="text-white font-medium">Email:</span>
                  <br />
                  <a href={`mailto:${config.contact.email}`} className="text-neutral-400 hover:text-[#E22B2B] transition-colors">
                    {config.contact.email}
                  </a>
                </li>
              </ul>

              {/* Mini Map */}
              <div className="rounded-lg overflow-hidden h-[120px] border border-neutral-700">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1097.9893781772598!2d123.95057130262597!3d10.31254061844564!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a9993cc853238d%3A0xf750bf6ab6483471!2sAR%20Car%20Rentals%20%26%20Tour%20Services%20Cebu!5e0!3m2!1sen!2sph!4v1770650571353!5m2!1sen!2sph"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="AR Car Rentals Location"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Red Gradient */}
      <div className="py-4" style={{ background: 'linear-gradient(90deg, #E22B2B 0%, #b91c1c 50%, #991b1b 100%)' }}>
        <div className="mx-auto w-full max-w-[1600px]" style={{ paddingInline: 'clamp(1.5rem, 3vw, 3rem)' }}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            {/* Quick Links */}
            <div className="flex items-center gap-6 text-white">
              <Link to="/privacy-policy" className="hover:text-white/80 transition-colors">
                Privacy Policy
              </Link>
              <span className="text-white/50">|</span>
              <Link to="/aboutus" className="hover:text-white/80 transition-colors">
                Our History
              </Link>
              <span className="text-white/50">|</span>
              <Link to="/terms-of-service" className="hover:text-white/80 transition-colors">
                Terms of Service
              </Link>
            </div>

            {/* Copyright */}
            <p className="text-white/80">
              © {currentYear} {config.app.name}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
