import { Injectable } from '@angular/core';
import { BaseApi } from 'src/app/shared/apis/base.api';
import { CrudService } from 'src/app/shared/interfaces/crud-service.interface';

import { iCustomers } from '../interfaces/customers.interface';

@Injectable({
  providedIn: 'root',
})
export class AgroCustomerApi extends BaseApi<iCustomers> implements CrudService<iCustomers> {
  constructor() {
    super('agro_customers');
  }

  public async getPaginated(pageIndex: number, pageSize: number, columns = 'id, name') {
    return await this.selectPaginate<iCustomers>(columns, pageIndex, pageSize);
  }

  public async create(customer: iCustomers) {
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

  public async getAll() {
    const { data, error } = await this.select('id, name');
    if (error) {
      this.notificationService.error('Erro ao buscar clientes', error.message);
      throw new Error(error.message);
    }
    return data as unknown as iCustomers[];
  }

  public async getDataById(id: string) {
    const { data, error } = await this.getById(id);
    if (error) {
      this.notificationService.error('Erro ao buscar cliente', error.message);
      throw new Error(error.message);
    }
    return data as unknown as iCustomers;
  }

  public async updateData(id: string, customer: iCustomers) {
    const { data, error } = await this.update({ ...customer, id })
      .select('*')
      .single();
    if (error) {
      this.notificationService.error('Erro ao atualizar cliente', error.message);
      throw new Error(error.message);
    }
    return data;
  }

  public delete(id: string) {
    return this.deleteById(id, 'id');
  }
}
