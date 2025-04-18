import { Injectable } from '@angular/core';
import { BaseApi } from 'src/app/shared/apis/base.api';
import { CrudService } from 'src/app/shared/interfaces/crud-service.interface';

import { iProduct } from '../interfaces/products.interface';

@Injectable({
  providedIn: 'root',
})
export class AgroProductsApi extends BaseApi<iProduct> implements CrudService<iProduct> {
  constructor() {
    super('agro_products');
  }

  public async getAll(columns = 'id, name, package') {
    const { data, error } = await this.select(columns);
    if (error) {
      this.notificationService.error('Erro ao buscar produtos', error.message);
      throw new Error(error.message);
    }
    return data as unknown as iProduct[];
  }

  public async getDataById(id: string) {
    const { data, error } = await this.getById(id);
    if (error) {
      this.notificationService.error('Erro ao buscar produto', error.message);
      throw new Error(error.message);
    }
    return data as unknown as iProduct;
  }

  public async getPaginated(
    pageIndex: number,
    pageSize: number,
    columns = 'id, name, package',
    orderBy?: string,
    orderDirection?: 'asc' | 'desc',
    search?: { column: string; value: string },
  ) {
    return await this.selectPaginate<iProduct>(columns, pageIndex, pageSize, orderBy, orderDirection, search);
  }

  public delete(id: string) {
    return this.deleteById(id, 'id');
  }

  public async create(product: iProduct) {
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

  public async updateData(id: string, product: iProduct) {
    const { data, error } = await this.update({ ...product, id })
      .select('*')
      .single();
    if (error) {
      this.notificationService.error('Erro ao atualizar produto', error.message);
      throw new Error(error.message);
    }
    return data;
  }
}
