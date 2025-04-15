import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, signal, ViewChild, WritableSignal } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NgxMaskDirective } from 'ngx-mask';
import { startWith } from 'rxjs';
import { iProduct } from 'src/app/domain/products/interfaces/products.interface';

import { BaseListComponent } from '../../../../shared/components/base-list.component';
import { eDynamicField } from '../../../../widgets/components/dynamic-form/dynamic-field.enum';
import { DynamicFormConfig } from '../../../../widgets/components/dynamic-form/dynamic-form-config.interface';
import { DynamicFormComponent } from '../../../../widgets/components/dynamic-form/dynamic-form.component';
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
export class FormPurchaseOrdersPage extends BaseListComponent implements AfterViewInit {
  protected isConsult = signal(false);
  protected isNew = signal(false);
  protected order: WritableSignal<iOrder>;
  protected table = signal<iProductOrder[]>([]);
  protected products: iProduct[] = [];

  public productsOrdered = new FormArray<
    FormGroup<{
      id: FormControl<string>;
      name: FormControl<string>;
      price: FormControl<number | null>;
      quantity: FormControl<number | null>;
      weight: FormControl<number | null>;
      totalPrice: FormControl<number | null>;
      package: FormControl<string>;
      wayCountig: FormControl<string>;
    }>
  >([]);

  public ngAfterViewInit(): void {
    const isConsult = this.router.url.split('/')[4] === 'consult';
    const isNew = this.router.url.split('/')[4] === undefined;
    this.isConsult.set(isConsult);
    this.isNew.set(isNew);

    const findProducts = JSON.parse(localStorage.getItem('products') || '[]');
    if (findProducts.length > 0) {
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
          wayCountig: new FormControl<string>(product.wayCountig, { nonNullable: true }),
        });
        this.productsOrdered.push(productGroup);
      });

      this.table.set(this.productsOrdered.value as iProductOrder[]);

      this.productsOrdered.valueChanges.pipe(startWith(this.productsOrdered.value)).subscribe((value) => {
        const total = value.reduce((acc: number, item: any) => {
          const price = typeof +item.price === 'number' ? +item.price : 0;
          const quantity = typeof +item.quantity === 'number' ? +item.quantity : 0;
          const weight = typeof +item.weight === 'number' ? +item.weight : 0;
          return acc + price * (item.wayCountig === 'Q' ? quantity : weight);
        }, 0);

        this.dynamicForm.form.get('totalPrice')?.setValue(total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
      });
    }

    const findOnLocalStorage = JSON.parse(localStorage.getItem('purchase-orders') || '[]');
    if (findOnLocalStorage.length > 0) {
      const id = this.router.url.split('/')[3];
      if (id) {
        const order = findOnLocalStorage.find((order: any) => order.id == id);
        if (order) {
          this.dynamicForm.form.patchValue(order);
          this.productsOrdered.patchValue(order.productsOrdered);
          this.order = signal(order);
          if (isConsult) {
            this.dynamicForm.form.disable();
            this.productsOrdered.disable();
          }
        }
      }
    }

    const productsNameAndPackage = findProducts.map((product: iProduct) => ({
      name: product.name,
      package: product.package,
    }));

    this.productsOrdered.patchValue(productsNameAndPackage);
  }

  @ViewChild(DynamicFormComponent) public dynamicForm!: DynamicFormComponent;

  public orderConfig: DynamicFormConfig[] = [
    {
      label: 'Cliente',
      name: 'customerId',
      type: {
        field: eDynamicField.SELECT,
        typeField: 'text',
      },
      validations: [Validators.required],
      size: 8,
      placeholder: 'Selecione o cliente',
      select: {
        showSearch: true,
        options: JSON.parse(localStorage.getItem('customers') || '[]').map((customer: any) => ({
          label: customer.name,
          value: customer.name,
        })),
      },
    },
    {
      label: 'Data do Pedido',
      name: 'datePurchase',
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
        field: eDynamicField.INPUT,
        typeField: 'text',
      },
      validations: [Validators.required],
      size: 6,
      disabled: !this.router.url.split('/')[4],
      initialValue: 'Criando Pedido',
    },
    {
      label: 'Total do Pedido',
      name: 'totalPrice',
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

  protected submit(form: string) {
    const currentForm = JSON.parse(localStorage.getItem(form) || '[]');
    if (this.isNew()) {
      localStorage.setItem('id', (+(localStorage.getItem('id') || 0) + 1).toString());
      const { customerId, datePurchase, totalPrice } = this.dynamicForm.form.getRawValue();

      const order = {
        id: localStorage.getItem('id') || '',
        datePurchase,
        customerId,
        totalPrice,
        status: 'Criado',
        productsOrdered: this.productsOrdered.value,
      };

      currentForm.push(order);
      localStorage.setItem(form, JSON.stringify(currentForm));
    } else {
      const findIndex = currentForm.findIndex((order: any) => order.id == this.order().id);
      const order = {
        id: this.order().id,
        ...this.dynamicForm.form.getRawValue(),
        productsOrdered: this.productsOrdered.getRawValue(),
      };
      currentForm[findIndex] = order;
      localStorage.setItem(form, JSON.stringify(currentForm));
    }

    this.dynamicForm.form.reset();
    this.router.navigate(['/', 'purchase-orders', 'list']);
  }
}
