import { type FC } from 'react';
import { Outlet } from 'react-router-dom';
import AdminFloatingSidebar from '@components/ui/AdminFloatingSidebar';

/**
 * Admin Layout with Floating Sidebar
 * Fully responsive layout that adapts to all screen sizes and scaling settings
 */
export const AdminLayout: FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar rendered at top level so mobile hamburger is always visible */}
      <AdminFloatingSidebar />

      <div className="admin-layout-wrapper">
        {/* Main Content Area */}
        <main className="admin-main-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        /* Use landing page layout pattern for consistency and responsiveness */
        .admin-layout-wrapper {
          min-height: 100vh;
          margin-left: 280px;
          transition: margin-left 0.3s ease;
        }

        .admin-main-content {
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          padding: clamp(1.5rem, 3vw, 3rem);
        }

        /* 4K and Ultra-wide screens (2560px+) */
        @media (min-width: 2560px) {
          .admin-layout-wrapper {
            margin-left: 320px;
          }
        }

        /* Desktop (1440px - 2559px) */
        @media (min-width: 1440px) and (max-width: 2559px) {
          .admin-layout-wrapper {
            margin-left: 270px;
          }
        }

        /* 1920x1080 at 125% scale = 1536px effective (1280px - 1439px) */
        @media (min-width: 1280px) and (max-width: 1439px) {
          .admin-layout-wrapper {
            margin-left: 230px;
          }
        }

        /* Laptop (1024px - 1279px) */
        @media (min-width: 1024px) and (max-width: 1279px) {
          .admin-layout-wrapper {
            margin-left: 240px;
          }
        }

        /* Tablet (768px - 1023px) */
        @media (min-width: 768px) and (max-width: 1023px) {
          .admin-layout-wrapper {
            margin-left: 240px;
          }
        }

        /* Mobile (below 768px) */
        @media (max-width: 767px) {
          .admin-layout-wrapper {
            margin-left: 0;
          }

          .admin-main-content {
            padding-top: 4.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
