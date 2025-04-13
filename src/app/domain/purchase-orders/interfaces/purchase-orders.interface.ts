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
  quantity: number;
  price: number;
  totalPrice: number;
}

export type iOrderStatus = 'Criado' | 'Entregue' | 'Pago' | 'Cancelado';
