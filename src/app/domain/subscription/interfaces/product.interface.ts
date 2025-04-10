import { iPrice } from './price.interface';

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface iProduct {
  id: string;
  isActive: boolean;
  name: string;
  description: string;
  image: string;
  slug: string;
  metadata: { [key: string]: string };

  prices?: iPrice[];
}
