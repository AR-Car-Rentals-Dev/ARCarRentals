import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { MainLayout, AdminLayout } from '@components/layout';
import {
  LandingPage,
  BrowseVehiclesPage,
  NotFoundPage,
  PricingPage,
  ResourcesPage,
  LoginPage,
  AdminDashboardPage,
  AdminFleetPage,
  AdminBookingsPage,
  SidebarDemoPage,
} from '@pages/index';
import { BookingPage, CheckoutPage, ReceiptSubmittedPage } from '@pages/BrowseVehicles';
import { TrackBookingPage } from '@pages/TrackBookingPage';
import { BookingRouteGuard } from '@components/BookingRouteGuard';
import { ProtectedRoute } from '@components/ProtectedRoute';

/**
 * Route configuration
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout><LandingPage /></MainLayout>,
  },
  {
    path: '/browsevehicles',
    element: <MainLayout><BrowseVehiclesPage /></MainLayout>,
  },
  {
    path: '/browsevehicles/booking',
    element: (
      <MainLayout>
        <BookingRouteGuard requiredStep="booking">
          <BookingPage />
        </BookingRouteGuard>
      </MainLayout>
    ),
  },
  {
    path: '/browsevehicles/checkout',
    element: (
      <MainLayout>
        <BookingRouteGuard requiredStep="checkout">
          <CheckoutPage />
        </BookingRouteGuard>
      </MainLayout>
    ),
  },
  {
    path: '/browsevehicles/receipt-submitted',
    element: (
      <MainLayout hideFooter>
        <BookingRouteGuard requiredStep="submitted">
          <ReceiptSubmittedPage />
        </BookingRouteGuard>
      </MainLayout>
    ),
  },
  {
    path: '/browsevehicles/track/:reference',
    element: <MainLayout><TrackBookingPage /></MainLayout>,
  },
  {
    path: '/pricing',
    element: <MainLayout><PricingPage /></MainLayout>,
  },
  {
    path: '/resources',
    element: <MainLayout><ResourcesPage /></MainLayout>,
  },
  {
    path: '/sidebar-demo',
    element: <SidebarDemoPage />,
  },
  {
    path: '/admin/login',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <AdminDashboardPage /> },
      { path: 'fleet', element: <AdminFleetPage /> },
      { path: 'bookings', element: <AdminBookingsPage /> },
    ],
  },
  {
    path: '*',
    element: <MainLayout><NotFoundPage /></MainLayout>,
  },
];

/**
 * Router instance
 */
export const router = createBrowserRouter(routes);

export default router;
