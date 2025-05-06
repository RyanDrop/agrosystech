import { Route } from '@angular/router';

export const CUSTOMER_ORDER_ROUTES: Route[] = [
  {
    path: '',
    redirectTo: 'new',
    pathMatch: 'full',
  },
  {
    path: 'new/:id',
    title: 'Cadastro de Pedido',
    loadComponent: () => import('./pages/form-customer-order/form-customer-order.page').then((m) => m.FormCustomerOrderPage),
  },
  {
    path: 'finish',
    title: 'Pedido Finalizado',
    loadComponent: () => import('./pages/finish-order/finish-order.page').then((m) => m.FinishPage),
  },
];
