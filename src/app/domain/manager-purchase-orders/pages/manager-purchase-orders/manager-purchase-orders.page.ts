import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { catchError, from, of } from 'rxjs';
import { AgroCustomerApi } from 'src/app/domain/customers/apis/customers.api';
import { ORDER_STATUS } from 'src/app/domain/purchase-orders/constants/purchase-orders.constants';
import { convertDateRangeToISO } from 'src/app/shared/functions/convert-date-range-to-iso.function';
import { manyOrderPdf } from 'src/app/shared/functions/order-pdf.function';
import { ManagerFilter } from 'src/app/shared/interfaces/base.interface';

import { AgroManagerPurchaseOrdersApi } from '../../apis/manager-purchase-orders.api';
import { iOrder } from '../../interfaces/purchase-orders.interface';

@Component({
  selector: 'agro-manager-orders',
  imports: [
    NzTableModule,
    NzDividerModule,
    CommonModule,
    NzIconModule,
    NzToolTipModule,
    NzFormModule,
    NzInputModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzAlertModule,
    NzSelectModule,
    NzSpinModule,
    NzDatePickerModule,
    NzLayoutModule,
    NzCheckboxModule,
  ],
  templateUrl: './manager-purchase-orders.page.html',
  styleUrl: './manager-purchase-orders.page.scss',
})
export class ManagerPurchaseOrdersPage {
  protected isLoading = false;
  protected readonly clientesControl = new FormControl<string[]>([]);
  protected readonly statusControl = new FormControl<string[]>([]);
  protected readonly dateRange = new FormControl<string[]>([]);
  private readonly managerPurchaseOrdersApi = inject(AgroManagerPurchaseOrdersApi);
  protected listOfData: any[] = [];
  private readonly customersApi = inject(AgroCustomerApi);

  protected optionList: { name: string; id: string }[] = [];
  protected indexCustomer = 1;
  protected pageCustomer = 10;
  protected totalCustomer = 100;

  protected selection = new SelectionModel<iOrder>(true, []);

  protected readonly orderStatus = ORDER_STATUS;

  constructor() {
    this.loadMore();
  }

  protected getRandomNameList() {
    return from(this.customersApi.getPaginated(this.indexCustomer, this.pageCustomer, 'id, name')).pipe(
      catchError(() => of({ data: [], count: 0, page: 0 })),
    );
  }

  protected loadMore() {
    if (this.indexCustomer === 0) return;
    this.isLoading = true;
    this.getRandomNameList().subscribe((response) => {
      this.isLoading = false;
      const data = response.data;
      this.totalCustomer = response.count;
      this.optionList = [...this.optionList, ...data];
      this.indexCustomer = response.count > this.optionList.length ? this.indexCustomer + 1 : 0;
    });
  }

  protected filter() {
    this.selection.clear();
    const filters = [];
    const dateRange = this.dateRange.value;
    const clientes = this.clientesControl.value;

    if (dateRange && dateRange.length > 0) {
      const { startISO, endISO } = convertDateRangeToISO(dateRange);
      filters.push({ column: 'order_date', operator: 'gte', value: startISO });
      filters.push({ column: 'order_date', operator: 'lte', value: endISO });
    }

    if (clientes && clientes.length > 0) filters.push({ column: 'customer_id', operator: 'in', value: clientes });

    if (this.statusControl.value && this.statusControl.value.length > 0)
      filters.push({ column: 'status', operator: 'in', value: this.statusControl.value });

    from(
      this.managerPurchaseOrdersApi.getPaginateManager(
        0,
        10,
        '*, agro_customers(name)',
        'order_date',
        'desc',
        filters as ManagerFilter[],
      ),
    ).subscribe((response) => {
      this.listOfData = response.data;
    });
  }

  protected selectItem(item: iOrder) {
    if (this.selection.isSelected(item)) this.selection.deselect(item);
    else this.selection.select(item);
  }

  protected exportPdf() {
    if (this.selection.selected.length === 0) return;
    manyOrderPdf(this.selection.selected);
  }
}
