import { type FC } from 'react';
import { Outlet } from 'react-router-dom';
import AdminFloatingSidebar from '@components/ui/AdminFloatingSidebar';

/**
 * Admin Layout with Floating Sidebar
 */
export const AdminLayout: FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex gap-6 p-12 min-h-screen">
        {/* Floating Sidebar - Sticky */}
        <div className="sticky top-12 self-start h-[calc(100vh-6rem)]">
          <AdminFloatingSidebar />
        </div>

        {/* Main Content Area */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
