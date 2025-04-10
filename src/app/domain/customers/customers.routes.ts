import { Route } from '@angular/router';

export const CUSTOMERS_ROUTES: Route[] = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    title: 'Lista de Clientes',
    loadComponent: () => import('./pages/list-customers/list-customers.page').then((m) => m.ListCustomersPage),
  },
  {
    path: 'form',
    title: 'Cadastro de Clientes',
    loadComponent: () => import('./pages/form-customers/form-customers.page').then((m) => m.FormCustomersPage),
  },
  {
    path: 'form/:id/edit',
    title: 'Cadastro de Clientes',
    loadComponent: () => import('./pages/form-customers/form-customers.page').then((m) => m.FormCustomersPage),
  },
  {
    path: 'form/:id/consult',
    title: 'Cadastro de Clientes',
    loadComponent: () => import('./pages/form-customers/form-customers.page').then((m) => m.FormCustomersPage),
  },
];
