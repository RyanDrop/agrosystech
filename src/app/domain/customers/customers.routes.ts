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
    loadComponent: () => import('./pages/list-clients/list-clients.page').then((m) => m.ListClientsPage),
  },
  {
    path: 'form',
    title: 'Cadastro de Clientes',
    loadComponent: () => import('./pages/form-clients/form-clients.page').then((m) => m.FormClientsPage),
  },
  {
    path: 'form/:id/edit',
    title: 'Cadastro de Clientes',
    loadComponent: () => import('./pages/form-clients/form-clients.page').then((m) => m.FormClientsPage),
  },
  {
    path: 'form/:id/consult',
    title: 'Cadastro de Clientes',
    loadComponent: () => import('./pages/form-clients/form-clients.page').then((m) => m.FormClientsPage),
  },
];
