import { Injectable } from '@angular/core';

import { iProduct } from '../interfaces/product.interface';
import { BaseApi } from './../../../shared/apis/base.api';

@Injectable({
  providedIn: 'root',
})
export class ProductsApi extends BaseApi<iProduct> {
  constructor() {
    super('products');
  }

  public async getAll() {
    const { data } = await this.supabase
      .from(this.tableName)
      .select('*, prices!inner(*)', { count: 'exact' })
      .eq('active', true)
      .returns<iProduct[]>();
    return data || [];
  }
}
