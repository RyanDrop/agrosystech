import { Route } from '@angular/router';

export const PURCHASE_ORDERS_ROUTES: Route[] = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    title: 'Lista de Pedidos',
    loadComponent: () => import('./pages/list-purchase-orders/list-purchase-orders.page').then((m) => m.ListPurchaseOrdersPage),
  },
  {
    path: 'form',
    title: 'Cadastro de Pedidos',
    loadComponent: () => import('./pages/form-purchase-orders/form-purchase-orders.page').then((m) => m.FormPurchaseOrdersPage),
  },
  {
    path: 'form/:id/edit',
    title: 'Cadastro de Pedidos',
    loadComponent: () => import('./pages/form-purchase-orders/form-purchase-orders.page').then((m) => m.FormPurchaseOrdersPage),
  },
  {
    path: 'form/:id/consult',
    title: 'Cadastro de Pedidos',
    loadComponent: () => import('./pages/form-purchase-orders/form-purchase-orders.page').then((m) => m.FormPurchaseOrdersPage),
  },
];
