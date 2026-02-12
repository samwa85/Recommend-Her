import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

// Lazy load all pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const Mission = lazy(() => import('@/pages/Mission'));
const ForTalent = lazy(() => import('@/pages/ForTalent'));
const ForSponsors = lazy(() => import('@/pages/ForSponsors'));
const TalentPool = lazy(() => import('@/pages/TalentPool'));
const TalentDetail = lazy(() => import('@/pages/TalentDetail'));
const Resources = lazy(() => import('@/pages/Resources'));
const Contact = lazy(() => import('@/pages/Contact'));

// New Admin Pages (Single Source of Truth)
const OverviewPage = lazy(() => import('@/admin/pages/OverviewPage'));
const TalentPage = lazy(() => import('@/admin/pages/TalentPage'));
const SponsorsPage = lazy(() => import('@/admin/pages/SponsorsPage'));
const RequestsPage = lazy(() => import('@/admin/pages/RequestsPage'));
const MessagesPage = lazy(() => import('@/admin/pages/MessagesPage'));
const AnalyticsPage = lazy(() => import('@/admin/pages/AnalyticsPage'));

// Legacy Admin (for backward compatibility)
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const SuperAdminDashboard = lazy(() => import('@/pages/SuperAdminDashboard'));

// Route definitions
export const routes: RouteObject[] = [
  // Public routes
  { path: '/', element: <HomePage /> },
  { path: '/mission', element: <Mission /> },
  { path: '/for-talent', element: <ForTalent /> },
  { path: '/for-sponsors', element: <ForSponsors /> },
  { path: '/talent-pool', element: <TalentPool /> },
  { path: '/talent/:id', element: <TalentDetail /> },
  { path: '/resources', element: <Resources /> },
  { path: '/contact', element: <Contact /> },

  // New Admin Routes (Single Source of Truth)
  { path: '/admin', element: <OverviewPage /> },
  { path: '/admin/talent', element: <TalentPage /> },
  { path: '/admin/sponsors', element: <SponsorsPage /> },
  { path: '/admin/requests', element: <RequestsPage /> },
  { path: '/admin/messages', element: <MessagesPage /> },
  { path: '/admin/analytics', element: <AnalyticsPage /> },

  // Legacy Admin (for backward compatibility)
  { path: '/admin-legacy', element: <AdminDashboard /> },
  { path: '/super-admin', element: <SuperAdminDashboard /> },
];

// Route metadata for navigation
export const navLinks = [
  { path: '/', label: 'Home' },
  { path: '/for-talent', label: 'For Talent' },
  { path: '/for-sponsors', label: 'For Sponsors' },
  { path: '/talent-pool', label: 'Talent Pool' },
  { path: '/contact', label: 'Contact' },
];

// Admin navigation
export const adminNavLinks = [
  { path: '/admin', label: 'Overview', icon: 'LayoutDashboard' },
  { path: '/admin/talent', label: 'Talent', icon: 'Users' },
  { path: '/admin/sponsors', label: 'Sponsors', icon: 'Building2' },
  { path: '/admin/requests', label: 'Requests', icon: 'MessageSquare' },
  { path: '/admin/messages', label: 'Messages', icon: 'Mail' },
  { path: '/admin/analytics', label: 'Analytics', icon: 'BarChart3' },
];
