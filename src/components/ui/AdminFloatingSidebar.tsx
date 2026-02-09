import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Calendar,
  FileText,
  BarChart3,
  Users,
  Globe,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { authService } from '@services/authService';
import { LogoutModal } from './LogoutModal';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const AdminFloatingSidebar: React.FC = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showComingSoonToast, setShowComingSoonToast] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const handleComingSoonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowComingSoonToast(true);
    setIsMobileMenuOpen(false);
    setTimeout(() => setShowComingSoonToast(false), 6000);
  };

  const navSections: NavSection[] = [
    {
      title: 'MENU',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          href: '/admin/dashboard',
          icon: <LayoutDashboard className="nav-icon-svg" />,
        },
        {
          id: 'fleet',
          label: 'Fleet',
          href: '/admin/fleet',
          icon: <Car className="nav-icon-svg" />,
        },
        {
          id: 'bookings',
          label: 'Bookings',
          href: '/admin/bookings',
          icon: <Calendar className="nav-icon-svg" />,
        },
      ],
    },
    {
      title: 'FINANCIAL',
      items: [
        {
          id: 'invoices',
          label: 'Invoices',
          href: '/admin/invoices',
          icon: <FileText className="nav-icon-svg" />,
        },
        {
          id: 'analytics',
          label: 'Analytics',
          href: '/admin/analytics',
          icon: <BarChart3 className="nav-icon-svg" />,
        },
      ],
    },
    {
      title: 'WEBSITE',
      items: [
        {
          id: 'leads',
          label: 'Leads',
          href: '/admin/leads',
          icon: <Users className="nav-icon-svg" />,
        },
        {
          id: 'content',
          label: 'Website Content',
          href: '#',
          icon: <Globe className="nav-icon-svg" />,
          comingSoon: true,
        },
      ],
    },
    {
      title: 'TOOLS',
      items: [
        {
          id: 'settings',
          label: 'Settings',
          href: '#',
          icon: <Settings className="nav-icon-svg" />,
          comingSoon: true,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`admin-floating-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Header: Logo and Name */}
        <div className="sidebar-header">
          <div className="logo-container">
            <img src="/ARCarRentals.png" alt="AR Car Rentals" className="logo" />
            <div className="brand-name">AR Car Rentals</div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="sidebar-content">
          <div className="sidebar-nav-sections">
            {navSections.map((section) => (
              <div key={section.title} className="nav-section">
                <div className="section-title">{section.title}</div>
                <div className="section-items">
                  {section.items.map((item) => (
                    item.comingSoon ? (
                      <button
                        key={item.id}
                        onClick={handleComingSoonClick}
                        className="nav-item coming-soon-item"
                      >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                      </button>
                    ) : (
                      <NavLink
                        key={item.id}
                        to={item.href}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                      </NavLink>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Spacer to push logout to bottom */}
          <div className="sidebar-spacer" />

          {/* Logout Button - Always at bottom */}
          <div className="logout-section">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogoutClick();
              }}
              className="nav-item logout-button"
            >
              <span className="nav-icon">
                <LogOut className="nav-icon-svg" />
              </span>
              <span className="nav-label">Log out</span>
            </button>
          </div>
        </div>

        <style>{`
        .admin-floating-sidebar {
          background: #ffffff;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          width: 280px;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 3rem;
          left: 3rem;
          height: calc(100vh - 6rem);
          overflow: hidden;
          z-index: 50;
          transition: all 0.3s ease;
        }

        .sidebar-header {
          margin-bottom: 24px;
          flex-shrink: 0;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo {
          width: 48px;
          height: 48px;
          object-fit: contain;
        }

        .brand-name {
          font-size: 18px;
          font-weight: 700;
          color: #1a1a1a;
          letter-spacing: -0.02em;
        }

        .sidebar-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          padding-right: 4px;
          scrollbar-width: thin;
          scrollbar-color: #E5E7EB transparent;
          min-height: 0;
        }

        .sidebar-nav-sections {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .sidebar-spacer {
          flex: 1;
          min-height: 20px;
        }

        .logout-section {
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
          margin-top: auto;
        }

        .sidebar-content::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-content::-webkit-scrollbar-thumb {
          background: #E5E7EB;
          border-radius: 2px;
        }

        .sidebar-content::-webkit-scrollbar-thumb:hover {
          background: #D1D5DB;
        }

        .nav-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .section-title {
          font-size: 11px;
          font-weight: 600;
          color: #9ca3af;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 0 12px;
          margin-bottom: 4px;
        }

        .section-items {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border: none;
          background: transparent;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #1a1a1a;
          font-family: inherit;
          text-decoration: none;
          width: 100%;
          font-size: 14px;
          font-weight: 500;
        }

        .nav-item:hover {
          background: #f9fafb;
        }

        .nav-item.active {
          background: #E22B2B;
          color: white;
        }

        .nav-item.active:hover {
          background: #c71f1f;
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .nav-icon-svg {
          width: 20px;
          height: 20px;
        }

        .nav-label {
          font-size: 14px;
          font-weight: 500;
        }

        .coming-soon-item {
          opacity: 0.6;
          position: relative;
        }

        .coming-soon-item:hover {
          opacity: 0.8;
          background: #f9fafb;
        }

        .logout-button {
          text-align: left;
        }

        .mobile-menu-toggle {
          display: none;
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 1001;
          background: #E22B2B;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 10px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(226, 43, 43, 0.3);
          transition: all 0.2s;
        }

        .mobile-menu-toggle:hover {
          background: #c71f1f;
        }

        .mobile-menu-toggle:active {
          transform: scale(0.95);
        }

        .mobile-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }

        /* 4K and Ultra-wide screens (2560px+) */
        @media (min-width: 2560px) {
          .admin-floating-sidebar {
            width: 320px;
            top: 4rem;
            left: 4rem;
            height: calc(100vh - 8rem);
            border-radius: 20px;
            padding: 24px;
          }

          .brand-name {
            font-size: 20px;
          }

          .nav-item {
            padding: 14px 18px;
            gap: 14px;
          }

          .nav-icon-svg {
            width: 22px;
            height: 22px;
          }

          .nav-label {
            font-size: 15px;
          }
        }

        /* Large Desktop - 1920x1080 at 100% (1920px - 2559px) */
        @media (min-width: 1920px) and (max-width: 2559px) {
          .admin-floating-sidebar {
            width: 280px;
            top: 3rem;
            left: 3rem;
            height: calc(100vh - 6rem);
          }
        }

        /* Desktop (1440px - 1919px) */
        @media (min-width: 1440px) and (max-width: 1919px) {
          .admin-floating-sidebar {
            width: 270px;
            top: 2.5rem;
            left: 2.5rem;
            height: calc(100vh - 5rem);
            padding: 18px;
          }

          .brand-name {
            font-size: 17px;
          }
        }

        /* 1920x1080 at 125% scale = 1536px effective */
        /* CRITICAL: This prevents sidebar overlap at 125% Windows scaling */
        @media (min-width: 1280px) and (max-width: 1439px) {
          .admin-floating-sidebar {
            width: 230px;
            top: 2rem;
            left: 2rem;
            height: calc(100vh - 4rem);
            padding: 16px;
          }

          .brand-name {
            font-size: 16px;
          }

          .logo {
            width: 44px;
            height: 44px;
          }

          .nav-item {
            padding: 10px 14px;
            gap: 10px;
          }

          .nav-label {
            font-size: 13px;
          }

          .nav-icon-svg {
            width: 18px;
            height: 18px;
          }
        }

        /* Laptop (1024px - 1279px) */
        @media (min-width: 1024px) and (max-width: 1279px) {
          .admin-floating-sidebar {
            width: 240px;
            padding: 16px;
            left: 2rem;
            top: 2rem;
            height: calc(100vh - 4rem);
          }

          .brand-name {
            font-size: 16px;
          }

          .logo {
            width: 42px;
            height: 42px;
          }

          .nav-item {
            padding: 10px 12px;
            gap: 10px;
          }

          .nav-label {
            font-size: 13px;
          }

          .nav-icon-svg {
            width: 18px;
            height: 18px;
          }
        }

        /* Tablet (768px - 1023px) */
        @media (min-width: 768px) and (max-width: 1023px) {
          .admin-floating-sidebar {
            width: 240px;
            padding: 16px;
            left: 1.5rem;
            top: 1.5rem;
            height: calc(100vh - 3rem);
          }

          .logo {
            width: 40px;
            height: 40px;
          }

          .brand-name {
            font-size: 15px;
          }
        }

        /* Mobile (below 768px) */
        @media (max-width: 767px) {
          .mobile-menu-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .mobile-overlay {
            display: block;
          }

          .admin-floating-sidebar {
            position: fixed;
            top: 0;
            left: -100%;
            height: 100vh;
            width: min(280px, 80vw);
            margin: 0;
            border-radius: 0;
            z-index: 1000;
            transition: left 0.3s ease;
            overflow-y: auto;
          }

          .admin-floating-sidebar.mobile-open {
            left: 0;
          }

          .sidebar-content {
            max-height: calc(100vh - 100px);
          }
        }

        @media (max-width: 480px) {
          .admin-floating-sidebar {
            width: min(260px, 75vw);
          }

          .mobile-menu-toggle {
            top: 16px;
            left: 16px;
            padding: 8px;
          }
        }
      `}</style>
      </aside>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
      />

      {/* Coming Soon Toast */}
      {showComingSoonToast && (
        <div className="coming-soon-toast">
          <div className="toast-content">
            <div className="toast-icon">🚀</div>
            <div className="toast-text">
              <div className="toast-title">Coming Soon!</div>
              <div className="toast-message">This feature is under development and will be available in upcoming updates.</div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .coming-soon-toast {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 9999;
          animation: slideInRight 0.3s ease-out;
        }

        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .toast-content {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 16px 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          display: flex;
          gap: 12px;
          max-width: 400px;
          min-width: 320px;
        }

        .toast-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .toast-text {
          flex: 1;
        }

        .toast-title {
          font-size: 14px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 4px;
        }

        .toast-message {
          font-size: 13px;
          color: #6b7280;
          line-height: 1.4;
        }

        @media (max-width: 768px) {
          .coming-soon-toast {
            top: 80px;
            right: 16px;
            left: 16px;
          }

          .toast-content {
            min-width: auto;
            max-width: 100%;
          }
        }
      `}</style>
    </>
  );
};

export default AdminFloatingSidebar;
