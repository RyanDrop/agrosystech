import { Injectable } from '@angular/core';
import { BaseApi } from 'src/app/shared/apis/base.api';

import { iProduct } from '../interfaces/products.interface';

@Injectable({
  providedIn: 'root',
})
export class AgroProductsApi extends BaseApi<iProduct> {
  constructor() {
    super('agro_products');
  }

  public async insertProduct(product: iProduct) {
    const user_company = await this.getUserCompany();
    const { data, error } = await this.insert({ ...product, company_id: user_company.company_id })
      .select('*')
      .single();
    if (error) {
      this.notificationService.error('Erro ao cadastrar produto', error.message);
      throw new Error(error.message);
    }
    return data;
  }

  public async getProducts(columns = 'id, name, package') {
    const { data, error } = await this.select(columns);
    if (error) {
      this.notificationService.error('Erro ao buscar produtos', error.message);
      throw new Error(error.message);
    }
    return data as unknown as iProduct[];
  }

  public async getProductById(id: string) {
    const { data, error } = await this.getById(id);
    if (error) {
      this.notificationService.error('Erro ao buscar produto', error.message);
      throw new Error(error.message);
    }
    return data as unknown as iProduct;
  }

  public async updateProduct(id: string, product: iProduct) {
    const { data, error } = await this.update({ ...product, id })
      .select('*')
      .single();
    if (error) {
      this.notificationService.error('Erro ao atualizar produto', error.message);
      throw new Error(error.message);
    }
    return data;
  }

  public deleteProductById(id: string) {
    return this.deleteById(id, 'id');
  }
}
