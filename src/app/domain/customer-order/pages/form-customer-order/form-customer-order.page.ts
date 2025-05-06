import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NgxMaskDirective } from 'ngx-mask';
import { from, startWith } from 'rxjs';
import { eProductPackage } from 'src/app/domain/products/enums/products.enums';
import { iProduct } from 'src/app/domain/products/interfaces/products.interface';
import { AgroPurchaseOrdersApi } from 'src/app/domain/purchase-orders/apis/purchase-orders.api';
import { iOrder, iProductOrder } from 'src/app/domain/purchase-orders/interfaces/purchase-orders.interface';
import { generatePDF } from 'src/app/shared/functions/order-pdf.function';

import { DynamicFormComponent } from '../../../../widgets/components/dynamic-form/dynamic-form.component';

@Component({
  selector: 'agro-form-orders',
  imports: [
    DynamicFormComponent,
    NzButtonComponent,
    NzFlexModule,
    NzFormModule,
    NzInputModule,
    ReactiveFormsModule,
    NzDividerModule,
    NzTableModule,
    CommonModule,
    NgxMaskDirective,
    NzSelectModule,
    NzDropDownModule,
    FormsModule,
    NzIconModule,
    NzToolTipModule,
  ],
  templateUrl: './form-customer-order.page.html',
  styleUrl: './form-customer-order.page.scss',
})
export class FormCustomerOrderPage implements OnInit {
  protected order: WritableSignal<iOrder>;
  protected table = signal<iProductOrder[]>([]);
  protected products: iProduct[] = [];

  private readonly agroProductsApi = inject(AgroPurchaseOrdersApi);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NzNotificationService);

  protected quantityPerPackageValue: string;

  public productsOrdered = new FormArray<
    FormGroup<{
      id: FormControl<string>;
      name: FormControl<string>;
      price: FormControl<number | null>;
      quantity: FormControl<number | null>;
      weight: FormControl<number | null>;
      totalPrice: FormControl<number | null>;
      package: FormControl<string>;
      way_counting: FormControl<string>;
    }>
  >([]);

  ngOnInit(): void {
    const id = this.router.url.split('/')[3] || '';
    from(this.agroProductsApi.getById(id)).subscribe((order: any) => {
      if (order.error) {
        this.notificationService.error('Erro ao buscar pedido', order.error.message);
        this.router.navigate(['customer-order/finish']);
        return;
      }
      this.order = signal(order.data);
      this.getProducts();
    });
  }

  private getProducts() {
    this.order()?.products_ordered.forEach((product: iProductOrder) => {
      const productGroup = new FormGroup({
        id: new FormControl<string>(product.id, { nonNullable: true }),
        name: new FormControl<string>(product.name, { nonNullable: true }),
        price: new FormControl<number | null>(0, { nonNullable: true }),
        quantity: new FormControl<number | null>(product.quantity || 0),
        weight: new FormControl<number | null>(0),
        totalPrice: new FormControl<number | null>(0),
        package: new FormControl<string>(product.package, { nonNullable: true }),
        way_counting: new FormControl<string>(product.way_counting, { nonNullable: true }),
      });
      this.productsOrdered.push(productGroup);
    });

    this.table.set(this.productsOrdered.value as iProductOrder[]);

    this.productsOrdered.valueChanges.pipe(startWith(this.productsOrdered.value)).subscribe(() => {
      this.quantityPerPackageValue = this.calcQuantityPerPackage();
    });
  }

  protected async submit() {
    this.order().products_ordered = this.productsOrdered.value.map((product) => ({
      id: product.id || '',
      name: product.name || '',
      price: product.price ?? null,
      quantity: product.quantity ?? null,
      weight: product.weight ?? null,
      totalPrice: product.totalPrice ?? null,
      package: product.package || '',
      way_counting: product.way_counting || '',
    })) as iProductOrder[];
    delete this.order().agro_customers;

    from(this.agroProductsApi.update(this.order())).subscribe(() => {
      generatePDF(this.order());
      this.notificationService.success('Sucesso', 'Pedido atualizado com sucesso');
      this.router.navigate(['customer-order/finish']);
    });
  }

  protected calcQuantityPerPackage() {
    const quantitiesByPackage = this.productsOrdered.value.reduce(
      (acc: Record<string, number>, product: any) => {
        const pkg = product.package;
        const quantity = typeof +product.quantity === 'number' ? +product.quantity : 0;

        if (pkg in acc) {
          acc[pkg] += quantity;
        }

        return acc;
      },
      {
        [eProductPackage.CAIXA]: 0,
        [eProductPackage.CAIXA_MADEIRA]: 0,
        [eProductPackage.CAIXA_PAPELAO]: 0,
        [eProductPackage.UNIDADE]: 0,
        [eProductPackage.BANDEIJA]: 0,
        [eProductPackage.SACO]: 0,
      },
    );

    return `${quantitiesByPackage[eProductPackage.CAIXA]} ${eProductPackage.CAIXA} - ${
      quantitiesByPackage[eProductPackage.CAIXA_PAPELAO]
    } ${eProductPackage.CAIXA_PAPELAO} - ${quantitiesByPackage[eProductPackage.CAIXA_MADEIRA]} ${
      eProductPackage.CAIXA_MADEIRA
    } - ${quantitiesByPackage[eProductPackage.UNIDADE]} ${eProductPackage.UNIDADE} - ${
      quantitiesByPackage[eProductPackage.BANDEIJA]
    } ${eProductPackage.BANDEIJA} - ${quantitiesByPackage[eProductPackage.SACO]} ${eProductPackage.SACO}`;
  }
}
