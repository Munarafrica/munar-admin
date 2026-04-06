import React from 'react';
import { createBrowserRouter, Navigate, Outlet, useNavigate } from 'react-router-dom';

// App Shell & Layout
import { AppShell, EventLayout, PublicLayout } from '../components/AppShell';
import { EventResolver } from '../components/EventResolver';
import { ModuleGuard } from '../components/ModuleGuard';
import { RequireAuth, RequireTenant, RedirectIfAuth } from '../components/auth/AuthGuard';

// Auth Pages
import { Login } from '../pages/Login';
import { SignUp } from '../pages/SignUp';
import { EmailVerification } from '../pages/EmailVerification';
import { ProfileSetup } from '../pages/ProfileSetup';
import { ForgotPassword } from '../pages/ForgotPassword';
import { ResetPassword } from '../pages/ResetPassword';
import { ChangePassword } from '../pages/ChangePassword';
import { AccountType } from '../pages/AccountType';

// Platform Pages
import { MyEvents } from '../pages/MyEvents';
import { CreateEvent } from '../pages/CreateEvent';
import { TicketCheckoutCallback } from '../pages/TicketCheckoutCallback';

// Event Admin Pages
import { EventDashboard } from '../pages/EventDashboard';
import { TicketManagement } from '../pages/TicketManagement';
import { ProgramManagement } from '../pages/ProgramManagement';
import { FormManagement } from '../pages/FormManagement';
import { MerchandiseManagement } from '../pages/MerchandiseManagement';
import { VotingManagement } from '../pages/VotingManagement';
import { DPMakerAdmin } from '../pages/DPMakerAdmin';
import { GalleryAdmin } from '../pages/GalleryAdmin';
import { SponsorsManagement } from '../pages/SponsorsManagement';
import { EventAnalytics } from '../pages/EventAnalytics';
import { WebsiteBuilder } from '../pages/WebsiteBuilder';
import { FinanceManagement } from '../pages/FinanceManagement';
import { Settings } from '../pages/Settings';

// Public Module Pages
import { TicketsPublic } from '../modules/tickets/TicketsPublic';
import { VotingPublic } from '../modules/voting/VotingPublic';
import { MerchPublic } from '../modules/merch/MerchPublic';
import { FormsPublic } from '../modules/forms/FormsPublic';
import { FormFill } from '../modules/forms/FormFill';
import { DPMakerPublic } from '../pages/DPMakerPublic';
import { GalleryPublic } from '../pages/GalleryPublic';
import { EventWebsitePublic } from '../modules/website/EventWebsitePublic';

// 404 Pages
import { NotFound } from '../pages/NotFound';

// Navigation compatibility wrapper
import { useAppNavigate } from '../lib/navigation';

function WithNav({ Component, extraProps }: { Component: React.ComponentType<any>; extraProps?: Record<string, any> }) {
  const onNavigate = useAppNavigate();
  return <Component onNavigate={onNavigate} {...extraProps} />;
}

function CreateEventRoute() {
  const appNavigate = useAppNavigate();
  const navigate = useNavigate();

  return (
    <CreateEvent
      onClose={() => appNavigate('my-events')}
      onContinue={() => {
        const eventId = localStorage.getItem('munar_current_event_id');
        if (eventId) {
          navigate(`/events/${eventId}`);
        } else {
          appNavigate('my-events');
        }
      }}
      onNavigate={appNavigate}
    />
  );
}

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      // ── Auth Routes ─────
      { path: '/login', element: <RedirectIfAuth><WithNav Component={Login} /></RedirectIfAuth> },
      { path: '/signup', element: <RedirectIfAuth><WithNav Component={SignUp} /></RedirectIfAuth> },
      { path: '/verify-email', element: <WithNav Component={EmailVerification} /> },
      { path: '/account-type', element: <RequireAuth><WithNav Component={AccountType} /></RequireAuth> },
      { path: '/profile-setup', element: <RequireAuth><WithNav Component={ProfileSetup} /></RequireAuth> },
      { path: '/forgot-password', element: <WithNav Component={ForgotPassword} /> },
      { path: '/reset-password', element: <WithNav Component={ResetPassword} /> },
      { path: '/change-password', element: <RequireAuth><ChangePassword /></RequireAuth> },

      // ── Platform Routes (require authentication) ─────
      { path: '/', element: <Navigate to="/events" replace /> },
      { path: '/events', element: <RequireTenant><WithNav Component={MyEvents} /></RequireTenant> },
      { path: '/events/create', element: <RequireTenant><CreateEventRoute /></RequireTenant> },
      { path: '/finance', element: <RequireAuth><WithNav Component={FinanceManagement} /></RequireAuth> },
      { path: '/settings', element: <RequireAuth><WithNav Component={Settings} /></RequireAuth> },
      { path: '/checkout/tickets/callback', element: <TicketCheckoutCallback /> },

      // ── Event Admin Routes ─────
      {
        path: '/events/:eventId',
        element: (
          <RequireTenant>
            <EventResolver>
              <EventLayout>
                <Outlet />
              </EventLayout>
            </EventResolver>
          </RequireTenant>
        ),
        children: [
          { index: true, element: <WithNav Component={EventDashboard} /> },
          { path: 'tickets', element: <WithNav Component={TicketManagement} /> },
          { path: 'program', element: <WithNav Component={ProgramManagement} /> },
          { path: 'forms', element: <WithNav Component={FormManagement} /> },
          { path: 'merchandise', element: <WithNav Component={MerchandiseManagement} /> },
          { path: 'voting', element: <WithNav Component={VotingManagement} /> },
          { path: 'sponsors', element: <WithNav Component={SponsorsManagement} /> },
          { path: 'dp-maker', element: <WithNav Component={DPMakerAdmin} /> },
          { path: 'gallery', element: <WithNav Component={GalleryAdmin} /> },
          { path: 'analytics', element: <WithNav Component={EventAnalytics} /> },
          { path: 'website', element: <WebsiteBuilder /> },
        ],
      },

      // ── Public Event Routes (attendee-facing) ──────
      {
        path: '/e/:eventSlug',
        element: (
          <EventResolver useSlug>
            <PublicLayout>
              <Outlet />
            </PublicLayout>
          </EventResolver>
        ),
        children: [
          // Event Website (root)
          { index: true, element: <EventWebsitePublic /> },

          // Standalone module public pages
          {
            path: 'tickets',
            element: (
              <ModuleGuard moduleType="tickets">
                <TicketsPublic />
              </ModuleGuard>
            ),
          },
          {
            path: 'voting',
            element: (
              <ModuleGuard moduleType="voting">
                <VotingPublic />
              </ModuleGuard>
            ),
          },
          {
            path: 'merch',
            element: (
              <ModuleGuard moduleType="merch">
                <MerchPublic />
              </ModuleGuard>
            ),
          },
          {
            path: 'forms',
            element: (
              <ModuleGuard moduleType="forms">
                <FormsPublic />
              </ModuleGuard>
            ),
          },
          {
            path: 'forms/:formId',
            element: (
              <ModuleGuard moduleType="forms">
                <FormFill />
              </ModuleGuard>
            ),
          },
          {
            path: 'dp-maker',
            element: (
              <ModuleGuard moduleType="dp-maker">
                <WithNav Component={DPMakerPublic} />
              </ModuleGuard>
            ),
          },
          {
            path: 'gallery',
            element: (
              <ModuleGuard moduleType="gallery">
                <WithNav Component={GalleryPublic} />
              </ModuleGuard>
            ),
          },
        ],
      },

      // ── Catch-all 404 ─────
      { path: '*', element: <NotFound /> },
    ],
  },
]);
