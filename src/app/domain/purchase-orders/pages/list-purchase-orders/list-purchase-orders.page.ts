import 'jspdf-autotable';

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable, { Styles } from 'jspdf-autotable';
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

    // Adiciona imagem na lateral esquerda
    const imageX = 14; // margem da esquerda
    const imageY = 5; // topo
    const imageWidth = 20;
    const imageHeight = 20;

    doc.addImage('assets/images/logo-celinho.png', 'PNG', imageX, imageY, imageWidth, imageHeight);

    // Agora desenha a tabela do lado direito da imagem
    autoTable(doc, {
      head: [[`Pedido #${order.id}`]],
      body: [[`${order.customerId} - ${new Date(order.datePurchase).toLocaleDateString('pt-BR')}`]],
      headStyles: { fillColor: '#82c25e', fontStyle: 'bold', halign: 'left' },
      columnStyles: { 0: { fontStyle: 'bold', halign: 'left' } },
      startY: imageY,
      margin: { left: imageX + imageWidth + 10 }, // empurra a tabela para a direita da imagem
    });

    const filterQuantityOrWeightEqualEmptyOrZero = order.productsOrdered.filter((product) => {
      const hasQuantity = product.quantity && typeof +product.quantity === 'number' && product.quantity > 0;
      const hasWeight = product.weight && typeof +product.weight === 'number' && product.weight > 0;
      return hasQuantity || hasWeight;
    });

    const tableData = filterQuantityOrWeightEqualEmptyOrZero.map((product) => {
      const price = product.price && typeof +product.price === 'number' ? +product.price : 0;
      const quantity = product.quantity && typeof +product.quantity === 'number' ? +product.quantity : 0;
      const weight = product.weight && typeof +product.weight === 'number' ? +product.weight : 0;
      return [
        product.package,
        product.name,
        `${quantity}${weight ? ` - ${weight}kg` : ''}`,
        `${price == 0 ? '' : `R$ ${price.toFixed(2)}`}`,
        `${price == 0 ? '' : `R$ ${(price * (product.wayCountig === 'Q' ? quantity : weight)).toFixed(2)}`}`,
      ];
    });

    autoTable(doc, {
      head: [['Em.', 'Nome', 'Quantidade', 'Preço', 'SubTotal']],
      body: tableData,
      headStyles: { fillColor: '#82c25e', halign: 'justify' },
      columnStyles: {
        ...tableData.map(() => ({ fontSize: 8 })),
      } as {
        [key: string]: Partial<Styles>;
      },
    });

    const filterProductsOfCx = order.productsOrdered.filter((product) => {
      return product.package === 'CX';
    });

    const quantityOfCx = filterProductsOfCx.reduce((acc: number, item: any) => {
      const quantity = typeof +item.quantity === 'number' ? +item.quantity : 0;
      return acc + quantity;
    }, 0);

    autoTable(doc, {
      head: [['Caixas', 'Total']],
      body: [[quantityOfCx, `${order.totalPrice}`]],
      headStyles: { fillColor: '#82c25e', halign: 'right', fontStyle: 'bold' },
      columnStyles: {
        0: { halign: 'right', fontStyle: 'bold' },
        1: { halign: 'right', fontStyle: 'bold' },
      },
    });

    doc.save(`Pedido:${order.customerId} - Data: ${new Date(order.datePurchase).toLocaleDateString('pt-BR')}.pdf`);
  }
}
