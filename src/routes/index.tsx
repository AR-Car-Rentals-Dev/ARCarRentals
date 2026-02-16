import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { MainLayout, AdminLayout } from '@components/layout';
import {
  LandingPage,
  BrowseVehiclesPage,
  NotFoundPage,
  HowToRentPage,
  AboutUsPage,
  ContactUsPage,
  PrivacyPolicyPage,
  TermsOfServicePage,
  LoginPage,
  AdminDashboardPage,
  AdminFleetPage,
  AdminBlogsPage,
  AdminBlogEditorPage,
  AdminBlogPreviewPage,
  AdminBookingsPage,
  AdminLeadsPage,
  AdminAnalyticsPage,
  AdminInvoicesPage,
  SidebarDemoPage,
} from '@pages/index';
import { BookingPage, CheckoutPage, ReceiptSubmittedPage } from '@pages/BrowseVehicles';
import { BlogListPage } from '@pages/BlogListPage';
import { BlogPostPage } from '@pages/BlogPostPage';
import { TrackBookingPage } from '@pages/TrackBookingPage';
import { TrackBookingLookupPage } from '@pages/TrackBookingLookupPage';
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
    path: '/track-booking',
    element: <MainLayout><TrackBookingLookupPage /></MainLayout>,
  },
  {
    path: '/track/:reference',
    element: <MainLayout><TrackBookingPage /></MainLayout>,
  },
  {
    path: '/how-to-rent',
    element: <MainLayout><HowToRentPage /></MainLayout>,
  },
  {
    path: '/aboutus',
    element: <MainLayout><AboutUsPage /></MainLayout>,
  },
  {
    path: '/contact',
    element: <MainLayout><ContactUsPage /></MainLayout>,
  },
  {
    path: '/blogs',
    element: <MainLayout><BlogListPage /></MainLayout>,
  },
  {
    path: '/blogs/:slug',
    element: <MainLayout><BlogPostPage /></MainLayout>,
  },
  {
    path: '/privacy-policy',
    element: <MainLayout><PrivacyPolicyPage /></MainLayout>,
  },
  {
    path: '/terms-of-service',
    element: <MainLayout><TermsOfServicePage /></MainLayout>,
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
      { path: 'blogs', element: <AdminBlogsPage /> },
      { path: 'blogs/new', element: <AdminBlogEditorPage /> },
      { path: 'blogs/:id', element: <AdminBlogEditorPage /> },
      { path: 'blogs/:id/preview', element: <AdminBlogPreviewPage /> },
      { path: 'bookings', element: <AdminBookingsPage /> },
      { path: 'leads', element: <AdminLeadsPage /> },
      { path: 'analytics', element: <AdminAnalyticsPage /> },
      { path: 'invoices', element: <AdminInvoicesPage /> },
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
