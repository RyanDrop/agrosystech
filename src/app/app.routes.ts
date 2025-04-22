import { Route } from '@angular/router';

import { isLoggedInGuard } from './core/guards/is-logged-in/is-logged-in.guard';
import { isNotLoggedInGuard } from './core/guards/is-not-logged/is-not-logged.guard';

export const APP_ROUTES: Route[] = [
  {
    path: 'subscription',
    loadChildren: () => import('./domain/subscription/subscription.routes').then((m) => m.SUBSCRIPTION_ROUTES),
    canActivate: [isLoggedInGuard],
  },
  {
    path: 'auth',
    loadComponent: () => import('./core/layout/auth/auth.layout').then((m) => m.AuthLayout),
    canActivate: [isLoggedInGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./domain/auth/auth.routes').then((m) => m.AUTH_ROUTES),
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./core/pages/reset-password/reset-password.page').then((m) => m.ResetPasswordPage),
        canActivate: [isLoggedInGuard],
      },
    ],
  },
  {
    path: '',
    loadComponent: () => import('./core/layout/dashboard/dashboard.layout').then((m) => m.DashboardLayout),
    canActivate: [isNotLoggedInGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () => import('./domain/home/pages/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'customers',
        title: 'Clientes',
        loadChildren: () => import('./domain/customers/customers.routes').then((m) => m.CUSTOMERS_ROUTES),
      },
      {
        path: 'products',
        title: 'Produtos',
        loadChildren: () => import('./domain/products/products.routes').then((m) => m.PRODUCTS_ROUTES),
      },
      {
        path: 'purchase-orders',
        title: 'Pedidos',
        loadChildren: () => import('./domain/purchase-orders/purchase-orders.routes').then((m) => m.PURCHASE_ORDERS_ROUTES),
      },
      {
        path: 'manager-purchase-orders',
        title: 'Gerenciador de Pedidos',
        loadChildren: () =>
          import('./domain/manager-purchase-orders/manager-purchase-orders.routes').then((m) => m.MANAGER_PURCHASE_ORDERS_ROUTES),
      },
    ],
  },
];
