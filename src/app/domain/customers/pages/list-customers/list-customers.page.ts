import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { from } from 'rxjs';

import { BaseListComponent } from '../../../../shared/components/base-list.component';
import { AgroCustomerApi } from '../../apis/customers.api';
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
export class ListCustomersPage extends BaseListComponent implements OnInit {
  protected readonly search = new FormControl('');
  private readonly customersApi = inject(AgroCustomerApi);

  protected listOfData: iCustomers[] = [];

  public override ngOnInit(): void {
    super.ngOnInit();
    this.loadingService.start();
    from(this.customersApi.getCustomers()).subscribe(
      (customers) => {
        this.listOfData = customers;
        this.loadingService.stop();
      },
      () => this.loadingService.stop(),
    );
  }
  protected deleteCustomer(id: string): void {
    from(this.customersApi.deleteById(id)).subscribe((response) => {
      if (response) {
        this.notificationService.success('Cliente excluído', 'O cliente foi excluído com sucesso', {
          nzDuration: 10000,
        });
        this.listOfData = this.listOfData.filter((customer) => customer.id !== id);
      }
    });
  }
}
