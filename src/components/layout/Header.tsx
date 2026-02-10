import { type FC, useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Facebook, Linkedin, Clock, MapPin, Phone } from 'lucide-react';
import { motion, useAnimationControls } from 'framer-motion';
import { cn } from '@utils/helpers';
import { config } from '@utils/config';
import { Button, BookNowModal } from '@components/ui';
import { useScroll, useIsMobile } from '@hooks/index';

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

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Vehicles', href: '/browsevehicles' },
  { label: 'About Us', href: '/aboutus' },
  { label: 'Contact Us', href: '/contact' },
];

/**
 * Top bar with contact info and social links - 40px height, red gradient 40% width with slant
 * Hidden on mobile devices
 */
const TopBar: FC = () => (
  <div className="relative h-[40px] bg-white overflow-hidden hidden lg:block">
    {/* Red gradient section - extends from left edge, ends at center of Browse Vehicles nav item */}
    <div 
      className="absolute left-0 top-0 h-full lg:w-[54%] xl:w-[48%]"
      style={{
        background: 'linear-gradient(to right, #FB3030 0%, #480E0E 100%)',
        clipPath: 'polygon(0 0, 96% 0, 100% 100%, 0 100%)',
      }}
    />
    
    {/* Content container - aligns with navigation */}
    <div className="relative h-full mx-auto w-full max-w-[1600px] flex items-center justify-between" style={{ paddingInline: 'clamp(1.5rem, 3vw, 3rem)' }}>
      {/* Business hours and location - inside gradient */}
      <div className="flex items-center gap-8 text-white text-sm font-medium">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span className="whitespace-nowrap">{config.contact.businessHours}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span className="whitespace-nowrap">{config.contact.location}</span>
        </div>
      </div>
      
      {/* Social icons on the right - black icons */}
      <div className="flex items-center gap-4">
        <a
          href="https://www.facebook.com/arcarrentalsservicescebu"
          target="_blank"
          rel="noopener noreferrer"
          className="text-black hover:text-[#E22B2B] transition-colors"
          aria-label="Follow us on Facebook"
        >
          <Facebook className="h-4 w-4" />
        </a>
        <a
          href="https://www.linkedin.com/in/ar-car-rentals-tour-services-cebu-9674693aa/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-black hover:text-[#E22B2B] transition-colors"
          aria-label="Follow us on LinkedIn"
        >
          <Linkedin className="h-4 w-4" />
        </a>
        <a
          href="viber://chat?number=%2B639423943545"
          target="_blank"
          rel="noopener noreferrer"
          className="text-black hover:text-[#E22B2B] transition-colors"
          aria-label="Chat on Viber"
        >
          <ViberIcon />
        </a>
        <a
          href="https://api.whatsapp.com/send/?phone=639423943545&text&type=phone_number&app_absent=0"
          target="_blank"
          rel="noopener noreferrer"
          className="text-black hover:text-[#E22B2B] transition-colors"
          aria-label="Chat on WhatsApp"
        >
          <WhatsAppIcon />
        </a>
      </div>
    </div>
  </div>
);

/**
 * Main Header component with navigation
 */
export const Header: FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBookNowModalOpen, setIsBookNowModalOpen] = useState(false);
  const { isScrolled } = useScroll({ threshold: 50 });
  const isMobile = useIsMobile();
  const location = useLocation();
  
  // Check if we're on the browse vehicles page
  const isBrowseVehiclesPage = location.pathname === '/browsevehicles';
  
  // Check if we're on the booking, checkout, or receipt submitted page - disable animations
  const isBookingPage = location.pathname === '/browsevehicles/booking';
  const isCheckoutPage = location.pathname === '/browsevehicles/checkout';
  const isReceiptSubmittedPage = location.pathname === '/browsevehicles/receipt-submitted';
  const disableHeaderAnimation = isBookingPage || isCheckoutPage || isReceiptSubmittedPage;
  
  // Animation controls for header visibility
  const controls = useAnimationControls();
  const lastScrollY = useRef(0);
  const isHidden = useRef(false);

  useEffect(() => {
    // Skip scroll animations on booking/checkout pages
    if (disableHeaderAnimation) return;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingUp = currentScrollY < lastScrollY.current;
      
      // At top of page - always show header
      if (currentScrollY <= 50) {
        if (isHidden.current) {
          isHidden.current = false;
          controls.start({
            y: 0,
            transition: { duration: 0.5, ease: 'easeOut' }
          });
        }
      } 
      // Scrolling up - show header
      else if (scrollingUp && isHidden.current) {
        isHidden.current = false;
        controls.start({
          y: 0,
          transition: { duration: 0.5, ease: 'easeOut' }
        });
      } 
      // Scrolling down - hide header
      else if (!scrollingUp && !isHidden.current && currentScrollY > 50) {
        isHidden.current = true;
        controls.start({
          y: -120, // Hide header (TopBar 40px + Nav 80px)
          transition: { duration: 0.6, ease: 'easeInOut' }
        });
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [controls, disableHeaderAnimation]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Handle Book Now click based on current page
  const handleBookNowClick = () => {
    if (isBrowseVehiclesPage) {
      // Scroll to cars section on browse vehicles page
      const carsSection = document.getElementById('cars-section');
      if (carsSection) {
        carsSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Open modal on other pages (like landing page)
      setIsBookNowModalOpen(true);
    }
  };

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 bg-[#121212]"
      initial={{ y: 0 }}
      animate={disableHeaderAnimation ? { y: 0 } : controls}
      transition={disableHeaderAnimation ? { duration: 0 } : undefined}
    >
      <TopBar />
      <nav
        className={cn(
          'bg-[#121212] transition-shadow duration-300 h-[80px]',
          isScrolled && 'shadow-md'
        )}
      >
        <div className="h-full mx-auto w-full max-w-[1600px]" style={{ paddingInline: 'clamp(1.5rem, 3vw, 3rem)' }}>
          <div className="flex h-full items-center justify-between">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 sm:gap-3 flex-shrink-0"
              onClick={closeMobileMenu}
            >
              <img 
                src="/ARCarRentals.png" 
                alt="AR Car Rentals Logo" 
                className="h-10 sm:h-14 w-auto"
              />
              <span className="font-semibold text-sm sm:text-lg text-white tracking-wide whitespace-nowrap">
                AR CAR RENTALS
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'font-medium text-[15px] transition-colors hover:text-white',
                      isActive ? 'text-white' : 'text-neutral-300'
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            {/* Desktop CTA - Need Help Button */}
            <div className="hidden lg:flex items-center flex-shrink-0">
              <a 
                href="tel:+639566625224"
                className="flex items-center gap-3 px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
              >
                <div className="w-10 h-10 bg-[#E22B2B] rounded-full flex items-center justify-center">
                  <Phone className="h-5 w-5 text-white fill-white" strokeWidth={0} fill="currentColor" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-xs font-medium">Need help?</span>
                  <span className="text-white text-sm font-bold">+63 956 662 5224</span>
                </div>
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-white hover:text-[#E22B2B] transition-colors"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobile && (
            <div
              className={cn(
                'md:hidden overflow-hidden transition-all duration-300 bg-[#121212]',
                isMobileMenuOpen ? 'max-h-96 pb-4' : 'max-h-0'
              )}
            >
              <div className="flex flex-col gap-2 pt-4 border-t border-neutral-800">
                {navItems.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      cn(
                        'px-4 py-2 rounded-lg font-medium transition-colors',
                        isActive
                          ? 'bg-[#E22B2B]/10 text-[#E22B2B]'
                          : 'text-neutral-300 hover:bg-neutral-800'
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                <div className="mt-2 px-4">
                  <Button 
                    variant="primary" 
                    fullWidth
                    onClick={() => {
                      closeMobileMenu();
                      handleBookNowClick();
                    }}
                    className="bg-[#E22B2B] hover:bg-[#c92525] border-none"
                  >
                    {isBrowseVehiclesPage ? 'View Cars' : 'Book Now'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Book Now Modal */}
      <BookNowModal
        isOpen={isBookNowModalOpen}
        onClose={() => setIsBookNowModalOpen(false)}
      />
    </motion.header>
  );
};

export default Header;
