import { Route } from '@angular/router';

export const PRODUCTS_ROUTES: Route[] = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    title: 'Lista de Produtos',
    loadComponent: () => import('./pages/list-products/list-products.page').then((m) => m.ListProductsPage),
  },
  {
    path: 'form',
    title: 'Cadastro de Produtos',
    loadComponent: () => import('./pages/form-products/form-products.page').then((m) => m.FormProductsPage),
  },
  {
    path: 'form/:id/edit',
    title: 'Cadastro de Produtos',
    loadComponent: () => import('./pages/form-products/form-products.page').then((m) => m.FormProductsPage),
  },
  {
    path: 'form/:id/consult',
    title: 'Cadastro de Produtos',
    loadComponent: () => import('./pages/form-products/form-products.page').then((m) => m.FormProductsPage),
  },
];
