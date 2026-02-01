import { type FC, useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Facebook, Instagram, Twitter, Clock, MapPin } from 'lucide-react';
import { motion, useAnimationControls } from 'framer-motion';
import { cn } from '@utils/helpers';
import { config } from '@utils/config';
import { Button, BookNowModal } from '@components/ui';
import { useScroll, useIsMobile } from '@hooks/index';

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Browse Vehicles', href: '/browsevehicles' },
  { label: 'How to Rent', href: '/pricing' },
  { label: 'About Us', href: '/resources' },
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
    <div className="relative h-full mx-auto w-full max-w-7xl flex items-center justify-between" style={{ paddingInline: 'clamp(1rem, 5vw, 5rem)' }}>
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
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-black hover:text-[#E22B2B] transition-colors"
          aria-label="Follow us on Facebook"
        >
          <Facebook className="h-4 w-4" />
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-black hover:text-[#E22B2B] transition-colors"
          aria-label="Follow us on Instagram"
        >
          <Instagram className="h-4 w-4" />
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-black hover:text-[#E22B2B] transition-colors"
          aria-label="Follow us on Twitter"
        >
          <Twitter className="h-4 w-4" />
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
        <div className="h-full mx-auto w-full max-w-7xl" style={{ paddingInline: 'clamp(1rem, 5vw, 5rem)' }}>
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

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center flex-shrink-0">
              <Button 
                variant="primary" 
                size="md"
                onClick={handleBookNowClick}
                className="bg-[#E22B2B] hover:bg-[#c92525] border-none rounded-md px-6 font-medium whitespace-nowrap"
              >
                {isBrowseVehiclesPage ? 'View Cars' : 'Book Now'}
              </Button>
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
