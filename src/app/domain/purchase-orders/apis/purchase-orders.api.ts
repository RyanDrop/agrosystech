import { Injectable } from '@angular/core';
import { BaseApi } from 'src/app/shared/apis/base.api';
import { CrudService } from 'src/app/shared/interfaces/crud-service.interface';

import { iOrder } from '../interfaces/purchase-orders.interface';

@Injectable({
  providedIn: 'root',
})
export class AgroPurchaseOrdersApi extends BaseApi<iOrder> implements CrudService<iOrder> {
  constructor() {
    super('agro_purchase_orders');
  }

  public async getPaginated(
    pageIndex: number,
    pageSize: number,
    columns = '*, agro_customers(name)',
    orderBy = 'order_date',
    orderDirection: 'asc' | 'desc' = 'desc',
  ) {
    return await this.selectPaginate<iOrder>(columns, pageIndex, pageSize, orderBy, orderDirection);
  }

  public async create(order: iOrder) {
    const user_company = await this.getUserCompany();
    const { data, error } = await this.insert({ ...order, company_id: user_company.company_id })
      .select('*')
      .single();
    if (error) {
      this.notificationService.error('Erro ao cadastrar pedido', error.message);
      throw new Error(error.message);
    }
    return data;
  }

  public async getAll() {
    const { data, error } = await this.select('*, agro_customers(name)');
    if (error) {
      this.notificationService.error('Erro ao buscar pedidos', error.message);
      throw new Error(error.message);
    }
    return data as unknown as iOrder[];
  }

  public async getDataById(id: string) {
    const { data, error } = await this.getById(id);
    if (error) {
      this.notificationService.error('Erro ao buscar pedido', error.message);
      throw new Error(error.message);
    }
    return data as unknown as iOrder;
  }

  public async updateData(id: string, customer: iOrder) {
    const { data, error } = await this.update({ ...customer, id })
      .select('*')
      .single();
    if (error) {
      this.notificationService.error('Erro ao atualizar pedido', error.message);
      throw new Error(error.message);
    }
    return data;
  }

  public delete(id: string) {
    return this.deleteById(id, 'id');
  }
}
