import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/dashboard/dashboard')
        .then(m => m.Dashboard)
  },
  {
    path: 'practice',
    loadComponent: () =>
      import('./features/practice/practice')
        .then(m => m.Practice)
  },
  {
    path: 'exams',
    loadComponent: () =>
      import('./features/exams/exams')
        .then(m => m.Exams)
  },
  {
    path: 'review',
    loadComponent: () =>
      import('./features/review/review')
        .then(m => m.Review)
  },
  {
    path: 'analytics',
    loadComponent: () =>
      import('./features/analytics/analytics')
        .then(m => m.Analytics)
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile')
        .then(m => m.Profile)
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings')
        .then(m => m.Settings)
  },
  {
    path: '**',
    redirectTo: ''
  }
];