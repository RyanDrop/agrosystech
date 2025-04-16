import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { AgroCustomerApi } from 'src/app/domain/customers/apis/customers.api';
import { AgroProductsApi } from 'src/app/domain/products/apis/products.api';
import { iProduct } from 'src/app/domain/products/interfaces/products.interface';
/* eslint-disable @typescript-eslint/naming-convention */
import { CommonModule } from '@angular/common';
import { NgxMaskDirective } from 'ngx-mask';
import { from, map, startWith } from 'rxjs';

import { BaseListComponent } from '../../../../shared/components/base-list.component';
import { eDynamicField } from '../../../../widgets/components/dynamic-form/dynamic-field.enum';
import { DynamicFormComponent } from '../../../../widgets/components/dynamic-form/dynamic-form.component';
import { AgroPurchaseOrdersApi } from '../../apis/purchase-orders.api';
import { iOrder, iProductOrder } from './../../interfaces/purchase-orders.interface';

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
  ],
  templateUrl: './form-purchase-orders.page.html',
  styleUrl: './form-purchase-orders.page.scss',
})
export class FormPurchaseOrdersPage extends BaseListComponent {
  protected order: WritableSignal<iOrder>;
  protected table = signal<iProductOrder[]>([]);
  protected products: iProduct[] = [];
  private readonly purchaseOrdersApi = inject(AgroPurchaseOrdersApi);
  private readonly customersApi = inject(AgroCustomerApi);
  private readonly productApi = inject(AgroProductsApi);
  private readonly totalAmount = new FormControl(0);

  private readonly pedido = `
  1 abóbora nova 
  2 batatas doce 
  2 inhames
  1 pepino japonês 
  1 pimentão colorido 
  1 goiaba 
  1 manga
  2 maracujás
  `;

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

  public override async getData() {
    this.dynamicFormConfig = [
      {
        label: 'Cliente',
        name: 'customer_id',
        type: {
          field: eDynamicField.SELECT,
          typeField: 'text',
        },
        validations: [Validators.required],
        size: 8,
        placeholder: 'Selecione o cliente',
        select: {
          showSearch: true,
          options$: from(this.customersApi.getCustomers()).pipe(
            map((customers) => {
              return customers.map((customer) => ({ label: customer.name, value: customer.id }));
            }),
          ),
        },
      },
      {
        label: 'Data do Pedido',
        name: 'order_date',
        type: {
          field: eDynamicField.DATE,
          typeField: 'text',
        },
        validations: [Validators.required],
        size: 4,
        placeholder: 'Selecione a data do pedido',
      },
      {
        label: 'Status',
        name: 'status',
        type: {
          field: eDynamicField.SELECT,
          typeField: 'text',
        },
        select: {
          showSearch: true,
          options: [
            {
              label: 'Criando Pedido',
              value: 'Criando Pedido',
            },
            {
              label: 'Criado',
              value: 'Criado',
            },
            {
              label: 'Entregue',
              value: 'Entregue',
            },
            {
              label: 'Pago',
              value: 'Pago',
            },
            {
              label: 'Cancelado',
              value: 'Cancelado',
            },
          ],
        },
        validations: [Validators.required],
        size: 6,
        disabled: !this.router.url.split('/')[4],
        initialValue: 'Criando Pedido',
      },
      {
        label: 'Total do Pedido',
        name: 'total_screen',
        type: {
          field: eDynamicField.INPUT,
          typeField: 'text',
        },
        validations: [Validators.required],
        size: 6,
        disabled: true,
        maskPrefix: 'R$ ',
      },
    ];

    if (!this.isNew() && this.id()) {
      from(this.purchaseOrdersApi.getOrderById(this.id())).subscribe((order) => {
        this.order = signal(order);
        this.dynamicForm.form.patchValue(order);
        this.getProducts();
      });
    } else {
      this.getProducts();
    }
  }

  private getProducts() {
    from(this.productApi.getProducts('id, name, package, way_counting')).subscribe((findProducts) => {
      this.products = findProducts.sort((a: iProduct, b: iProduct) => a.name.localeCompare(b.name));

      this.products.forEach((product: iProduct) => {
        const productGroup = new FormGroup({
          id: new FormControl<string>(product.id, { nonNullable: true }),
          name: new FormControl<string>(product.name, { nonNullable: true }),
          price: new FormControl<number | null>(null),
          quantity: new FormControl<number | null>(null),
          weight: new FormControl<number | null>(null),
          totalPrice: new FormControl<number | null>(null),
          package: new FormControl<string>(product.package, { nonNullable: true }),
          way_counting: new FormControl<string>(product.way_counting, { nonNullable: true }),
        });
        this.productsOrdered.push(productGroup);
      });

      if (this.order) this.productsOrdered.patchValue(this.order()?.products_ordered);

      this.table.set(this.productsOrdered.value as iProductOrder[]);

      this.productsOrdered.valueChanges.pipe(startWith(this.productsOrdered.value)).subscribe((value) => {
        const total = value.reduce((acc: number, item: any) => {
          const price = typeof +item.price === 'number' ? +item.price : 0;
          const quantity = typeof +item.quantity === 'number' ? +item.quantity : 0;
          const weight = typeof +item.weight === 'number' ? +item.weight : 0;
          return acc + price * (item.way_counting === 'Q' ? quantity : weight);
        }, 0);

        this.totalAmount.setValue(total);
        this.dynamicForm.form
          .get('total_screen')
          ?.setValue(total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), { emitEvent: false });
      });

      const productsNameAndPackage = this.products.map((product: iProduct) => ({
        name: product.name,
        package: product.package,
      }));

      this.productsOrdered.patchValue(productsNameAndPackage);
      if (this.isConsult()) {
        this.dynamicForm.form.disable();
        this.productsOrdered.disable();
      }
    });
  }

  protected async submit() {
    const { customer_id, order_date, status } = this.dynamicForm.form.getRawValue();
    const products_ordered = this.productsOrdered
      .getRawValue()
      .filter((product) => product.quantity || product.weight) as iProductOrder[];

    if (this.isNew()) {
      const data = await this.purchaseOrdersApi.insertOrder({
        customer_id,
        order_date,
        status: 'Criado',
        total_amount: this.totalAmount.value,
        products_ordered,
        active: true,
      } as iOrder);
      if (data) {
        this.dynamicForm.form.reset();
        this.notificationService.success('Sucesso', 'Pedido criado com sucesso');
        this.router.navigate(['/', 'purchase-orders', 'list']);
      }
    } else {
      const data = await this.purchaseOrdersApi.updateOrder(this.id(), {
        customer_id,
        order_date,
        status,
        total_amount: this.totalAmount.value,
        products_ordered,
        active: true,
      } as iOrder);
      if (data) {
        this.dynamicForm.form.reset();
        this.notificationService.success('Sucesso', 'Pedido atualizado com sucesso');
        this.router.navigate(['/', 'purchase-orders', 'list']);
      }
    }
  }
}
