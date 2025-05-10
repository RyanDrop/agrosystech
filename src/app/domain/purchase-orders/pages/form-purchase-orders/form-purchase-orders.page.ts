import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzFloatButtonModule } from 'ng-zorro-antd/float-button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { debounceTime, from, fromEvent, map, startWith } from 'rxjs';
import { AgroCustomerApi } from 'src/app/domain/customers/apis/customers.api';
import { AgroProductsApi } from 'src/app/domain/products/apis/products.api';
import { eProductPackage } from 'src/app/domain/products/enums/products.enums';
import { iProduct } from 'src/app/domain/products/interfaces/products.interface';
import { BaseFormComponent } from 'src/app/shared/components/base-form.component';
import { PACKAGE_OPTIONS } from 'src/app/shared/constants/package-options.constants';
/* eslint-disable @typescript-eslint/naming-convention */
import { CommonModule } from '@angular/common';
import { NgxMaskDirective } from 'ngx-mask';

import { eDynamicField } from '../../../../widgets/components/dynamic-form/dynamic-field.enum';
import { DynamicFormComponent } from '../../../../widgets/components/dynamic-form/dynamic-form.component';
import { AgroPurchaseOrdersApi } from '../../apis/purchase-orders.api';
import { ImportOrderComponent } from '../../components/import-order/import-order.component';
import { ShareOrderComponent } from '../../components/share-order/share-order.component';
import { ORDER_STATUS } from '../../constants/purchase-orders.constants';
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
    NzIconModule,
    NzToolTipModule,
    NzFloatButtonModule,
  ],
  templateUrl: './form-purchase-orders.page.html',
  styleUrl: './form-purchase-orders.page.scss',
})
export class FormPurchaseOrdersPage extends BaseFormComponent<iOrder> {
  protected order: WritableSignal<iOrder>;
  protected table = signal<iProductOrder[]>([]);
  protected products: iProduct[] = [];
  protected showUpButton = signal(false);
  protected showDownButton = signal(true);

  private readonly customersApi = inject(AgroCustomerApi);
  private readonly productApi = inject(AgroProductsApi);
  private readonly totalAmount = new FormControl(0);
  protected readonly packageOptionsData = PACKAGE_OPTIONS;
  protected quantityPerPackageValue: string;

  constructor() {
    super(inject(AgroPurchaseOrdersApi));

    fromEvent(window, 'scroll')
      .pipe(debounceTime(300))
      .subscribe((event) => {
        const scrollTop = (event.target as Document).documentElement.scrollTop;
        const scrollHeight = (event.target as Document).documentElement.scrollHeight;
        this.showUpButton.set(scrollTop > 1000);
        this.showDownButton.set(scrollTop < scrollHeight - 1000);
      });
  }

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
          options$: from(this.customersApi.getAll()).pipe(
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
          options: ORDER_STATUS,
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
      from(this.crudService.getDataById(this.id())).subscribe((order) => {
        this.order = signal(order);
        this.dynamicForm.form.patchValue(order);
        this.getProducts();
      });
    } else {
      this.getProducts();
    }
  }

  private getProducts() {
    from(this.productApi.getAll('id, name, package, way_counting')).subscribe((findProducts) => {
      this.products = findProducts.sort((a: iProduct, b: iProduct) => a.name.localeCompare(b.name));

      this.products.forEach((product: iProduct) => {
        const findProduct = this.order && this.order()?.products_ordered.find((item: iProductOrder) => item.id === product.id);
        const productGroup = new FormGroup({
          id: new FormControl<string>(product.id, { nonNullable: true }),
          name: new FormControl<string>(product.name, { nonNullable: true }),
          price: new FormControl<number | null>(findProduct?.price || null, { nonNullable: true }),
          quantity: new FormControl<number | null>(findProduct?.quantity || null),
          weight: new FormControl<number | null>(findProduct?.weight || null),
          totalPrice: new FormControl<number | null>(findProduct?.totalPrice || null),
          package: new FormControl<string>(findProduct?.package || product.package, { nonNullable: true }),
          way_counting: new FormControl<string>(product.way_counting, { nonNullable: true }),
        });
        this.productsOrdered.push(productGroup);
      });

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

        this.quantityPerPackageValue = this.calcQuantityPerPackage();
      });

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
      const data = await this.crudService.create({
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
      const data = await this.crudService.updateData(this.id(), {
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

  protected importOrder() {
    const modal = this.modal.create({
      nzTitle: 'Importar Pedido',
      nzContent: ImportOrderComponent,
      nzFooter: null,
      nzOnOk: () => new Promise((resolve) => resolve),
    });

    modal.afterClose.subscribe((data) => {
      if (data) {
        const lines = data.split('\n');
        const items = lines
          .map((line: string) => line.trim())
          .filter((line: string | any[]) => line.length > 0)
          .map((line: string) => {
            const match = line.match(/^(\d+)\s+(.+)$/);
            if (!match) {
              this.notificationService.error('Erro ao importar pedido', 'Formato inválido na linha: ' + line);
              throw new Error(`Formato inválido na linha: "${line}"`);
            }
            const quantity = parseInt(match[1], 10);
            let name = match[2].toLowerCase();
            name = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

            return { quantity, name };
          });

        const insertProduct = items
          .map((item: any) => {
            const product = this.products.find((p: iProduct) =>
              p.name
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .includes(item.name),
            );
            if (product) {
              const index = this.productsOrdered.value.findIndex((p) => p.id === product.id);
              this.productsOrdered.controls[index].get('quantity')?.setValue(item.quantity);
            }

            return product
              ? null
              : {
                  name: item.name,
                  quantity: item.quantity,
                };
          })
          .filter(Boolean);

        if (insertProduct.length > 0) {
          this.modal.confirm({
            nzTitle: 'Importar Pedido',
            nzContent: `
          <p>Os seguintes itens não foram encontrados:</p>
          <div class="red">
          ${insertProduct.map((item: any) => `<p [style]="'color:red'">* ${item.quantity} ${item.name}</p>`).join('')}</div>`,
            nzFooter: null,
            nzCancelDisabled: true,
            nzCancelText: null,
          });
        } else this.notificationService.success('Sucesso', 'Pedido importado com sucesso');
      }
    });
  }

  protected shareOrder() {
    this.modal
      .confirm({
        nzTitle: 'Compartilhar Pedido',
        nzContent: `
      <p>Qualquer pessoa com o link terá acesso ao pedido e poderá edita-lo uma vez, deseja continuar?</p>`,
        nzCancelText: 'Cancelar',
        nzOkText: 'Sim',
        nzOnOk: () => {
          return { confirm: true };
        },
      })
      .afterClose.subscribe((data) => {
        const order = this.order();
        order.products_ordered = this.productsOrdered.value.map((product) => ({
          id: product.id || '',
          name: product.name || '',
          price: product.price ?? null,
          quantity: product.quantity ?? null,
          weight: product.weight ?? null,
          totalPrice: product.totalPrice ?? null,
          package: product.package || '',
          way_counting: product.way_counting || '',
        })) as iProductOrder[];
        order.products_ordered_no_auth = true;
        delete order.agro_customers;

        const builder = this.crudService.updateData(this.id(), order);
        if (data?.confirm && builder) {
          from(builder).subscribe((response) => {
            if (response) {
              this.notificationService.success('Sucesso', 'Pedido compartilhado com sucesso', { nzDuration: 2000 });
              this.modal.create({
                nzTitle: 'Pedido Compartilhado',
                nzContent: ShareOrderComponent,
                nzFooter: null,
                nzData: { id: order.id },
              });
            }
          });
        } else {
          this.notificationService.error('Erro', 'Erro ao compartilhar pedido');
        }
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

  protected scroll(scrollTo: 'up' | 'down') {
    window.scrollTo({
      top: scrollTo === 'up' ? 0 : document.body.scrollHeight,
      behavior: 'smooth',
    });
  }
}
