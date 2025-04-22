import { Injectable } from '@angular/core';
import { BaseApi } from 'src/app/shared/apis/base.api';
import { ManagerFilter } from 'src/app/shared/interfaces/base.interface';

import { iOrder } from '../interfaces/purchase-orders.interface';

@Injectable({
  providedIn: 'root',
})
export class AgroManagerPurchaseOrdersApi extends BaseApi<iOrder> {
  constructor() {
    super('agro_purchase_orders');
  }

  public async getPaginateManager(
    pageIndex: number,
    pageSize: number,
    columns = '*, agro_customers(name)',
    orderBy = 'order_date',
    orderDirection: 'asc' | 'desc' = 'desc',
    filters?: ManagerFilter[],
  ) {
    return await this.selectPaginateManager(columns, pageIndex, pageSize, orderBy, orderDirection, filters);
  }
}
