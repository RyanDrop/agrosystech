import { Injectable } from '@angular/core';
import { BaseApi } from 'src/app/shared/apis/base.api';

import { iCustomers } from '../interfaces/customers.interface';

@Injectable({
  providedIn: 'root',
})
export class AgroCustomerApi extends BaseApi<iCustomers> {
  constructor() {
    super('agro_customers');
  }

  public async insertCustomer(customer: iCustomers) {
    const user_company = await this.getUserCompany();
    const { data, error } = await this.insert({ ...customer, company_id: user_company.company_id })
      .select('*')
      .single();
    if (error) {
      this.notificationService.error('Erro ao cadastrar cliente', error.message);
      throw new Error(error.message);
    }
    return data;
  }

  public async getCustomers() {
    const { data, error } = await this.select('id, name');
    if (error) {
      this.notificationService.error('Erro ao buscar clientes', error.message);
      throw new Error(error.message);
    }
    return data as unknown as iCustomers[];
  }

  public async getCustomerById(id: string) {
    const { data, error } = await this.getById(id);
    if (error) {
      this.notificationService.error('Erro ao buscar cliente', error.message);
      throw new Error(error.message);
    }
    return data as unknown as iCustomers;
  }

  public async updateCustomer(id: string, customer: iCustomers) {
    const { data, error } = await this.update({ ...customer, id })
      .select('*')
      .single();
    if (error) {
      this.notificationService.error('Erro ao atualizar cliente', error.message);
      throw new Error(error.message);
    }
    return data;
  }

  public deleteCustomerById(id: string) {
    return this.deleteById(id, 'id');
  }
}
