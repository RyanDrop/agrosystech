import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { catchError, from, of } from 'rxjs';
import { AgroCustomerApi } from 'src/app/domain/customers/apis/customers.api';
import { generatePDF } from 'src/app/shared/functions/order-pdf.function';
import { ManagerFilter } from 'src/app/shared/interfaces/base.interface';

import { BaseListComponent } from '../../../../shared/components/base-list.component';
import { AgroPurchaseOrdersApi } from '../../apis/purchase-orders.api';
import { ORDER_STATUS } from '../../constants/purchase-orders.constants';
import { iOrder } from './../../interfaces/purchase-orders.interface';

@Component({
  selector: 'agro-list-orders',
  imports: [
    NzTableModule,
    NzDividerModule,
    CommonModule,
    NzIconModule,
    NzToolTipModule,
    NzFormModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzAlertModule,
    NzSelectModule,
    NzSpinModule,
  ],
  templateUrl: './list-purchase-orders.page.html',
  styleUrl: './list-purchase-orders.page.scss',
})
export class ListPurchaseOrdersPage extends BaseListComponent<iOrder> implements OnInit {
  protected readonly clientesControl = new FormControl<string[]>([]);
  protected readonly statusControl = new FormControl<string[]>([]);
  protected optionList: { name: string; id: string }[] = [];
  protected indexCustomer = 1;
  protected pageCustomer = 100;
  protected totalCustomer = 100;
  protected readonly orderStatus = ORDER_STATUS;
  private readonly purchaseOrdersApi = inject(AgroPurchaseOrdersApi);
  private readonly customersApi = inject(AgroCustomerApi);

  constructor() {
    super(inject(AgroPurchaseOrdersApi));
    this.loadMore();
  }

  protected getRandomNameList() {
    return from(this.customersApi.getPaginated(this.indexCustomer, this.pageCustomer, 'id, name')).pipe(
      catchError(() => of({ data: [], count: 0, page: 0 })),
    );
  }

  protected loadMore() {
    if (this.indexCustomer === 0) return;
    this.loadingService.start();
    this.getRandomNameList().subscribe((response) => {
      this.loadingService.stop();
      const data = response.data;
      this.totalCustomer = response.count;
      this.optionList = [...this.optionList, ...data];
      this.indexCustomer = response.count > this.optionList.length ? this.indexCustomer + 1 : 0;
    });
  }

  protected override searchData(reset = false): void {
    this.loadingService.start();
    if (reset) this.pageIndex = 1;

    const filters: ManagerFilter[] = [];
    const clientes = this.clientesControl.value;
    const status = this.statusControl.value;

    if (clientes && clientes.length > 0) filters.push({ column: 'customer_id', operator: 'in', value: clientes });
    if (status && status.length > 0) filters.push({ column: 'status', operator: 'in', value: status });

    from(
      this.purchaseOrdersApi.selectPaginateManager<iOrder>(
        '*, agro_customers(name)',
        this.pageIndex,
        this.pageSize,
        'order_date',
        'desc',
        filters,
      ),
    ).subscribe(
      (response) => {
        this.loadingService.stop();
        this.total = response?.count ?? 0;
        this.listOfData = response?.data;
      },
      () => this.loadingService.stop(),
    );
  }

  protected generatePDF(order: iOrder): void {
    this.modal.confirm({
      nzTitle: 'Atenção',
      nzContent: 'Deseja gerar o PDF do pedido?',
      nzOkText: 'Sim',
      nzOkType: 'primary',

      nzOnOk: () => {
        generatePDF(order);
        this.notificationService.success('Sucesso', 'PDF gerado com sucesso');
      },
    });
  }
}
