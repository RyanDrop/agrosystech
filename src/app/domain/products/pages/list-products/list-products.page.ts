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
import { AgroProductsApi } from '../../apis/products.api';
import { iProduct } from './../../interfaces/products.interface';

@Component({
  selector: 'agro-list-products',
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
  templateUrl: './list-products.page.html',
  styleUrl: './list-products.page.scss',
})
export class ListProductsPage extends BaseListComponent implements OnInit {
  protected readonly search = new FormControl('');
  private readonly productApi = inject(AgroProductsApi);

  protected listOfData: iProduct[] = [];

  public override ngOnInit(): void {
    super.ngOnInit();
    this.loadingService.start();
    from(this.productApi.getProducts()).subscribe(
      (customers) => {
        this.listOfData = customers;
        this.loadingService.stop();
      },
      () => this.loadingService.stop(),
    );
  }
  protected deleteProduct(id: string): void {
    from(this.productApi.deleteById(id)).subscribe((response) => {
      if (response?.error) {
        this.notificationService.error('Erro', 'O produto não pode ser excluído', {
          nzDuration: 5000,
        });
      } else {
        this.notificationService.success('Sucesso', 'O produto foi excluído com sucesso', {
          nzDuration: 5000,
        });
        this.listOfData = this.listOfData.filter((product) => product.id !== id);
      }
    });
  }
}
