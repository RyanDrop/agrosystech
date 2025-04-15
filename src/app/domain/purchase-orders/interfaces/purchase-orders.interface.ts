/* eslint-disable @typescript-eslint/naming-convention */
import { iProduct } from '../../products/interfaces/products.interface';

export interface iOrder {
  id: string;
  datePurchase: string;
  customerId: string;
  totalPrice: number;
  status: iOrderStatus;
  productsOrdered: iProductOrder[];
}

export interface iProductOrder extends iProduct {
  quantity: number | null;
  weight: number | null;
  price: number | null;
  totalPrice: number | null;
}

export type iOrderStatus = 'Criado' | 'Entregue' | 'Pago' | 'Cancelado';
