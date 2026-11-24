import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/app-layout/app-layout').then((m) => m.AppLayout),
    children: [
      {
        path: '',
        title: 'Home - weeljack-admin',
        loadComponent: () => import('./pages/home/home').then((m) => m.Home),
      },
    ],
  },
];
