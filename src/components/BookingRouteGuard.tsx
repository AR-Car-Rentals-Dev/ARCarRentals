import { Navigate, useLocation } from 'react-router-dom';
import { isSessionValid, canAccessStep, type BookingStep } from '../utils/sessionManager';

interface BookingRouteGuardProps {
  children: React.ReactNode;
  requiredStep: BookingStep;
}

/**
 * Route guard for booking flow pages
 * Ensures users can only access pages they've progressed to
 */
export const BookingRouteGuard: React.FC<BookingRouteGuardProps> = ({ 
  children, 
  requiredStep 
}) => {
  const location = useLocation();
  
  // Check if session is valid
  if (!isSessionValid()) {
    // Redirect to browse page to start new session
    return <Navigate to="/browsevehicles" state={{ from: location }} replace />;
  }
  
  // Check if user can access this step
  if (!canAccessStep(requiredStep)) {
    // Redirect to browse page
    return <Navigate to="/browsevehicles" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};
