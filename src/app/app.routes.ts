import { Routes } from '@angular/router';

import { Layout } from './core/layout/layout/layout';

import { Dashboard } from './features/dashboard/dashboard';
import { StudyPlan } from './features/study-plan/study-plan';
import { Learning } from './features/learning/learning';
import { Practice } from './features/practice/practice';
import { MockExams } from './features/mock-exams/mock-exams';
import { Review } from './features/review/review';
import { Resources } from './features/resources/resources';
import { Flashcards } from './features/flashcards/flashcards';
import { Notes } from './features/notes/notes';
import { Analytics } from './features/analytics/analytics';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      { path: 'dashboard', component: Dashboard },
      { path: 'study-plan', component: StudyPlan },
      { path: 'learning', component: Learning },
      { path: 'practice', component: Practice },
      { path: 'mock-exams', component: MockExams },
      { path: 'review', component: Review },
      { path: 'resources', component: Resources },
      { path: 'flashcards', component: Flashcards },
      { path: 'notes', component: Notes },
      { path: 'analytics', component: Analytics }
    ]
  },

  { path: '**', redirectTo: 'dashboard' }
];