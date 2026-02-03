import { type FC, type ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authService, type User } from '@services/authService';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

/**
 * Protected route wrapper that checks authentication and role
 */
export const ProtectedRoute: FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to={requireAdmin ? "/admin/login" : "/login"} replace />;
  }

  // Requires admin but user is not admin/staff - redirect to customer dashboard
  if (requireAdmin && user.role !== 'admin' && user.role !== 'staff') {
    return <Navigate to="/customer/dashboard" replace />;
  }

  // User is admin/staff but trying to access customer routes - redirect to admin dashboard
  if (!requireAdmin && (user.role === 'admin' || user.role === 'staff') && window.location.pathname.includes('/customer/')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
