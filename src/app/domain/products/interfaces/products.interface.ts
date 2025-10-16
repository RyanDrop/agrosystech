// eslint-disable-next-line @typescript-eslint/naming-convention
export interface iProduct {
  id: string;
  name: string;
  package: ProductPackage;
  way_counting: WayCountig;
  company_id?: string;
}

export type ProductPackage = 'CX' | 'CXP' | 'CXM' | 'SC' | 'BDJ' | 'UN' | 'PNT';
export type WayCountig = 'Q' | 'W' | 'B';
