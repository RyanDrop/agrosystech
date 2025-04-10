import { iProduct } from './product.interface';

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface iPrice {
  id: string;
  isA: boolean;
  currency: string;
  interval: string;
  interval_count: number;
  nickname: string;
  product_id: string;
  type: string;
  unit_amount: number;
  created: Date;
  metadata: unknown;
  slug: string;
  lookup_key?: string;

  products?: iProduct;
}
