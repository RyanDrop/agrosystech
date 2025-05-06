import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { generatePDF } from 'src/app/shared/functions/order-pdf.function';

import { BaseListComponent } from '../../../../shared/components/base-list.component';
import { AgroPurchaseOrdersApi } from '../../apis/purchase-orders.api';
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
    NzInputModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzAlertModule,
    NzSelectModule,
  ],
  templateUrl: './list-purchase-orders.page.html',
  styleUrl: './list-purchase-orders.page.scss',
})
export class ListPurchaseOrdersPage extends BaseListComponent<iOrder> implements OnInit {
  protected override columnSearch = 'status';

  constructor() {
    super(inject(AgroPurchaseOrdersApi));
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
