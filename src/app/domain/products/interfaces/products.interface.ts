// eslint-disable-next-line @typescript-eslint/naming-convention
export interface iProduct {
  id: string;
  name: string;
  package: ProductPackage;
  wayCountig: WayCountig;
}

export type ProductPackage = 'CX' | 'CXP' | 'SC' | 'BDJ' | 'UN';
export type WayCountig = 'Q' | 'W';
