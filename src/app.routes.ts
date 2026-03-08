import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./app/features/home-page/home-page.component').then(m => m.HomePageComponent),
  },
  {
    path: 'valuation',
    loadComponent: () => import('./app/features/valuation-form/valuation-container.component').then(m => m.ValuationContainerComponent),
  },
  {
    path: 'blog',
    loadComponent: () => import('./app/features/blog/blog-list.component').then(m => m.BlogListComponent),
  },
  {
    path: 'privacidade',
    loadComponent: () => import('./app/features/privacy-policy/privacy-policy').then(m => m.PrivacyPolicyComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];