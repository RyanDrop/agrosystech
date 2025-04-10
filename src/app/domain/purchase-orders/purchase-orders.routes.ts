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
    loadComponent: () => import('./pages/purchase-orders/purchase-orders.page').then((m) => m.PurchaseOrdersPage),
  },
];
