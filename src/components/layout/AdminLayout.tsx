import { type FC, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Car,
  LayoutDashboard,
  CalendarDays,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
} from 'lucide-react';
import { cn } from '@utils/helpers';
import { authService } from '@services/authService';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const sidebarItems: SidebarItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Fleet', href: '/admin/fleet', icon: <Car className="h-5 w-5" /> },
  { label: 'Bookings', href: '/admin/bookings', icon: <CalendarDays className="h-5 w-5" /> },
  { label: 'Settings', href: '/admin/settings', icon: <Settings className="h-5 w-5" /> },
];

/**
 * Admin Layout with Sidebar
 */
export const AdminLayout: FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-neutral-900 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary-600">
              <Car className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-lg text-white">AR Car Rental Services</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen bg-neutral-900 transition-all duration-300',
          isSidebarOpen ? 'w-64' : 'w-20',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-6 border-b border-neutral-800">
          <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-primary-600 shadow-lg shadow-primary-600/30 flex-shrink-0">
            <Car className="h-6 w-6 text-white" />
          </div>
          {isSidebarOpen && (
            <div className="overflow-hidden">
              <span className="font-bold text-white text-lg whitespace-nowrap">AR Car Rental Services</span>
              <p className="text-neutral-500 text-xs">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Toggle Button (Desktop) */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-primary-600 text-white rounded-full items-center justify-center shadow-lg hover:bg-primary-700 transition-colors"
        >
          <ChevronRight className={cn('h-4 w-4 transition-transform', !isSidebarOpen && 'rotate-180')} />
        </button>

        {/* Navigation */}
        <nav className="px-3 py-6 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                )
              }
            >
              {item.icon}
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-neutral-800">
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-3 rounded-xl text-neutral-400 hover:bg-red-600/10 hover:text-red-500 transition-all duration-200',
              !isSidebarOpen && 'justify-center'
            )}
          >
            <LogOut className="h-5 w-5" />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          'transition-all duration-300 pt-16 lg:pt-0',
          isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        )}
      >
        {/* Top Bar */}
        <header className="hidden lg:flex items-center justify-between bg-white shadow-sm px-6 py-4 sticky top-0 z-30">
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Admin Dashboard</h1>
            <p className="text-sm text-neutral-500">Welcome back, Admin</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary-600 rounded-full" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-semibold">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
