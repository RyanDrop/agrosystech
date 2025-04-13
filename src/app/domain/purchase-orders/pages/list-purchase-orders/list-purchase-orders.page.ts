import 'jspdf-autotable';

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { BaseListComponent } from '../../../../shared/components/base-list.component';
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
export class ListPurchaseOrdersPage extends BaseListComponent {
  protected readonly search = new FormControl('');
  private readonly notificationService = inject(NzNotificationService);

  protected listOfData: iOrder[] = JSON.parse(localStorage.getItem('purchase-orders') || '[]');

  protected deleteOrder(id: string): void {
    const findIndex = this.listOfData.findIndex((customer: iOrder) => customer.id == id);
    this.listOfData.splice(findIndex, 1);
    localStorage.setItem('purchase-orders', JSON.stringify(this.listOfData));
    this.notificationService.success('Produto excluído', 'O produto foi excluído com sucesso', {
      nzDuration: 100000,
    });
    this.listOfData = JSON.parse(localStorage.getItem('purchase-orders') || '[]');
  }

  protected generatePDF(order: iOrder): void {
    const doc = new jsPDF();

    doc.addImage('assets/images/logo-text.png', 'PNG', 80, 0, 50, 20);

    autoTable(doc, {
      head: [['Cliente', 'Data do Pedido', 'Total']],
      body: [[order.customerId, new Date(order.datePurchase).toLocaleDateString('pt-BR'), `R$ ${order.totalPrice}`]],
      headStyles: { fillColor: '#82c25e' },
      startY: 20,
    });

    const tableData = order.productsOrdered.map((product) => [
      product.name,
      product.quantity,
      `R$ ${product.price.toFixed(2)}`,
      `R$ ${(product.price * +product.quantity).toFixed(2)}`,
    ]);

    autoTable(doc, {
      head: [['Nome', 'Quantidade', 'Preço', 'Total']],
      body: tableData,
      headStyles: { fillColor: '#82c25e' },
      startY: 40,
    });

    doc.save(`Pedido:${order.customerId} - Data: ${new Date(order.datePurchase).toLocaleDateString('pt-BR')}.pdf`);
  }
}
