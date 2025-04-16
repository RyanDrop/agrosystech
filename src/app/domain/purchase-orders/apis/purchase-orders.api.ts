import { Injectable } from '@angular/core';
import { BaseApi } from 'src/app/shared/apis/base.api';

import { iOrder } from '../interfaces/purchase-orders.interface';

@Injectable({
  providedIn: 'root',
})
export class AgroPurchaseOrdersApi extends BaseApi<iOrder> {
  constructor() {
    super('agro_purchase_orders');
  }

  public async insertOrder(order: iOrder) {
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

  public async getOrders() {
    const { data, error } = await this.select('*, agro_customers(name)');
    if (error) {
      this.notificationService.error('Erro ao buscar pedidos', error.message);
      throw new Error(error.message);
    }
    return data as unknown as iOrder[];
  }

  public async getOrderById(id: string) {
    const { data, error } = await this.getById(id);
    if (error) {
      this.notificationService.error('Erro ao buscar pedido', error.message);
      throw new Error(error.message);
    }
    return data as unknown as iOrder;
  }

  public async updateOrder(id: string, customer: iOrder) {
    const { data, error } = await this.update({ ...customer, id })
      .select('*')
      .single();
    if (error) {
      this.notificationService.error('Erro ao atualizar pedido', error.message);
      throw new Error(error.message);
    }
    return data;
  }

  public deleteOrderById(id: string) {
    return this.deleteById(id, 'id');
  }
}
