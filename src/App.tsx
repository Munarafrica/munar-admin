// Munar - Modular Event Operating System
// App entry point using React Router for URL-based routing
//
// Architecture: AppShell → EventResolver → BrandProvider → Module
// See src/router/index.tsx for complete route definitions

import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';

// Legacy Page type kept for backward compatibility with existing components
// Components can still accept onNavigate: (page: Page) => void
// The useAppNavigate() hook adapts this to React Router navigation
export type Page =
  | 'login'
  | 'signup'
  | 'verification'
  | 'account-type'
  | 'profile-setup'
  | 'forgot-password'
  | 'reset-password'
  | 'my-events'
  | 'create-event'
  | 'event-dashboard'
  | 'ticket-management'
  | 'program-management'
  | 'form-management'
  | 'merchandise-management'
  | 'voting-management'
  | 'public-vote'
  | 'dp-maker-admin'
  | 'dp-maker-public'
  | 'gallery-admin'
  | 'gallery-public'
  | 'sponsors-management'
  | 'event-analytics'
  | 'website-builder'
  | 'change-password';

function App() {
  return <RouterProvider router={router} />;
}

export default App;