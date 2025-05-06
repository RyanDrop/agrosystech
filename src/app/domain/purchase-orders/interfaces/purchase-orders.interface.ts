/* eslint-disable @typescript-eslint/naming-convention */
import { iProduct } from '../../products/interfaces/products.interface';

export interface iOrder {
  id: string;
  order_date: string;
  customer_id: string;
  agro_customers?: { name: string };
  total_amount: number;
  status: iOrderStatus;
  products_ordered: iProductOrder[];
  company_id?: string;
  active: boolean;
  products_ordered_no_auth: boolean;
}

export interface iProductOrder extends iProduct {
  quantity: number | null;
  weight: number | null;
  price: number | null;
  totalPrice: number | null;
}

export type iOrderStatus = 'Criando Pedido' | 'Criado' | 'Entregue' | 'Pago Pendente Vale' | 'Pago' | 'Cancelado';
