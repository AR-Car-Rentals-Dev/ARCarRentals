import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { authService } from '@services/authService';
import { LogoutModal } from './LogoutModal';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const AdminFloatingSidebar: React.FC = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
    },
    {
      id: 'fleet',
      label: 'Fleet',
      href: '/admin/fleet',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
          <circle cx="7" cy="17" r="2"></circle>
          <path d="M9 17h6"></path>
          <circle cx="17" cy="17" r="2"></circle>
        </svg>
      ),
    },
    {
      id: 'bookings',
      label: 'Bookings',
      href: '/admin/bookings',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      href: '/admin/settings',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      ),
    },
  ];

  return (
    <aside className="admin-floating-sidebar">
      {/* Admin Profile */}
      <div className="admin-profile">
        <div className="profile-avatar">
          <span>A</span>
        </div>
        <div className="profile-name">Admin</div>
      </div>

      {/* Divider */}
      <div className="sidebar-divider"></div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.href}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Divider */}
      <div className="sidebar-divider"></div>

      {/* Logout */}
      <button
        onClick={handleLogoutClick}
        className="nav-item logout-button"
      >
        <span className="nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </span>
        <span className="nav-label">Logout</span>
      </button>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
      />

      <style>{`
        .admin-floating-sidebar {
          background: #ffffff;
          border-radius: 20px;
          padding: 20px 16px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          width: 140px;
          display: flex;
          flex-direction: column;
          height: 100%;
          max-height: 100%;
          overflow: hidden;
          gap: 16px;
        }

        .admin-profile {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
        }

        .profile-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #ef4444;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 18px;
        }

        .profile-name {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .sidebar-divider {
          height: 1px;
          background: #e5e7eb;
          margin: 0;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
          flex: 1;
          scrollbar-width: thin;
          scrollbar-color: #E5E7EB transparent;
        }

        .sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-nav::-webkit-scrollbar-thumb {
          background: #E5E7EB;
          border-radius: 2px;
        }

        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: #D1D5DB;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 14px 12px;
          border: none;
          background: transparent;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #6b7280;
          gap: 6px;
          font-family: inherit;
          text-decoration: none;
          width: 100%;
        }

        .nav-item:hover {
          background: #fef2f2;
          color: #dc2626;
        }

        .nav-item:focus-visible {
          outline: 2px solid #ef4444;
          outline-offset: 2px;
        }

        .nav-item.active {
          background: #ef4444;
          color: white;
        }

        .nav-item.active:hover {
          background: #dc2626;
        }

        .logout-button {
          margin-top: auto;
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
        }

        .nav-label {
          font-size: 11px;
          font-weight: 500;
          text-align: center;
          line-height: 1.2;
          letter-spacing: 0.01em;
        }

        @media (max-width: 1024px) {
          .admin-floating-sidebar {
            width: 100px;
            padding: 12px 8px;
            border-radius: 24px;
          }

          .nav-item {
            padding: 12px 6px;
            gap: 6px;
          }

          .nav-icon {
            width: 20px;
            height: 20px;
          }

          .nav-icon svg {
            width: 20px;
            height: 20px;
          }

          .nav-label {
            font-size: 10px;
          }
        }
      `}</style>
    </aside>
  );
};

export default AdminFloatingSidebar;
