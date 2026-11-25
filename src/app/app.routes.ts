import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/app-layout/app-layout').then((m) => m.AppLayout),
    children: [
      {
        path: '',
        title: 'Dashboard - weeljack-admin',
        loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'tickets',
        title: 'Tickets - weeljack-admin',
        loadComponent: () => import('./pages/tickets/tickets').then((m) => m.Tickets),
      },
      {
        path: 'empty',
        title: 'Empty page - weeljack-admin',
        loadComponent: () => import('./pages/empty/empty').then((m) => m.Empty),
      },
    ],
  },
  // Before the full pages: their parent route ends in `**`, which would swallow `/landing`. Not nested
  // in `FullPage` either, so the landing keeps its own banner and contentinfo landmarks.
  {
    path: 'landing',
    title: 'Landing - weeljack-admin',
    loadComponent: () => import('./pages/landing/landing').then((m) => m.Landing),
  },
  // The full pages: no sidebar or top bar, but the same `LayoutService`, so the stored look holds.
  {
    path: '',
    loadComponent: () => import('./layout/full-page/full-page').then((m) => m.FullPage),
    children: [
      {
        path: 'auth/login',
        title: 'Sign in - weeljack-admin',
        loadComponent: () => import('./pages/auth/login/login').then((m) => m.Login),
      },
      {
        path: 'auth/error',
        title: 'Error - weeljack-admin',
        loadComponent: () => import('./pages/errors/error/error').then((m) => m.ErrorPage),
      },
      {
        path: 'auth/access',
        title: 'Access denied - weeljack-admin',
        loadComponent: () => import('./pages/errors/access/access').then((m) => m.Access),
      },
      {
        path: 'notfound',
        title: 'Page not found - weeljack-admin',
        loadComponent: () => import('./pages/errors/not-found/not-found').then((m) => m.NotFound),
      },
      // Last: an unknown address shows the not-found page in place and keeps the typed URL.
      {
        path: '**',
        title: 'Page not found - weeljack-admin',
        loadComponent: () => import('./pages/errors/not-found/not-found').then((m) => m.NotFound),
      },
    ],
  },
];
