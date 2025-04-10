import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { BaseListComponent } from '../../../../shared/components/base-list.component';
import { iCustomers } from '../../interfaces/customers.interface';

@Component({
  selector: 'agro-list-customers',
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
  ],
  templateUrl: './list-customers.page.html',
  styleUrl: './list-customers.page.scss',
})
export class ListCustomersPage extends BaseListComponent {
  protected readonly search = new FormControl('');
  private readonly notificationService = inject(NzNotificationService);

  protected listOfData: iCustomers[] = JSON.parse(localStorage.getItem('customers') || '[]');

  protected deleteCustomer(id: string): void {
    const findIndex = this.listOfData.findIndex((customer: iCustomers) => customer.id == id);
    this.listOfData.splice(findIndex, 1);
    localStorage.setItem('customers', JSON.stringify(this.listOfData));
    this.notificationService.success('Cliente excluído', 'O cliente foi excluído com sucesso', {
      nzDuration: 100000,
    });
    this.listOfData = JSON.parse(localStorage.getItem('customers') || '[]');
  }
}
