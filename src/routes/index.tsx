import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { MainLayout, AdminLayout } from '@components/layout';
import {
  LandingPage,
  BrowseVehiclesPage,
  NotFoundPage,
  FeaturesPage,
  PricingPage,
  ResourcesPage,
  LoginPage,
  AdminDashboardPage,
  AdminFleetPage,
  AdminBookingsPage,
} from '@pages/index';

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
    path: '/pricing',
    element: <MainLayout><PricingPage /></MainLayout>,
  },
  {
    path: '/resources',
    element: <MainLayout><ResourcesPage /></MainLayout>,
  },
  {
    path: '/admin/login',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
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
