import { Component, inject, signal, WritableSignal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { from } from 'rxjs';

import { BaseListComponent } from '../../../../shared/components/base-list.component';
import { eDynamicField } from '../../../../widgets/components/dynamic-form/dynamic-field.enum';
import { DynamicFormComponent } from '../../../../widgets/components/dynamic-form/dynamic-form.component';
import { AgroProductsApi } from '../../apis/products.api';
import { iProduct } from './../../interfaces/products.interface';

@Component({
  selector: 'agro-form-products',
  imports: [
    DynamicFormComponent,
    NzButtonComponent,
    NzFlexModule,
    NzFormModule,
    NzInputModule,
    ReactiveFormsModule,
    NzDividerModule,
  ],
  templateUrl: './form-products.page.html',
  styleUrl: './form-products.page.scss',
})
export class FormProductsPage extends BaseListComponent {
  protected product: WritableSignal<iProduct>;
  private readonly productApi = inject(AgroProductsApi);

  public override async getData() {
    this.dynamicFormConfig = [
      {
        label: 'Nome',
        name: 'name',
        type: {
          field: eDynamicField.INPUT,
          typeField: 'text',
        },
        validations: [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
        size: 16,
        placeholder: 'Digite o nome do produto',
      },
      {
        label: 'Embalagem',
        name: 'package',
        type: {
          field: eDynamicField.SELECT,
          typeField: 'text',
        },
        validations: [Validators.required],
        select: {
          hideClear: true,
          showSearch: true,
          options: [
            {
              label: 'CX',
              value: 'CX',
            },
            {
              label: 'CXP',
              value: 'CXP',
            },
            {
              label: 'UN',
              value: 'UN',
            },
            {
              label: 'BDJ',
              value: 'BDJ',
            },
            {
              label: 'SC',
              value: 'SC',
            },
          ],
        },
        initialValue: 'CX',
        size: 4,
      },
      {
        label: 'Forma de Calcular',
        name: 'way_counting',
        type: {
          field: eDynamicField.RADIO,
          typeField: 'text',
        },
        validations: [Validators.required],
        select: {
          hideClear: true,
          showSearch: true,
          options: [
            {
              label: 'Quantidade',
              value: 'Q',
            },
            {
              label: 'Peso',
              value: 'W',
            },
          ],
        },
        initialValue: 'Q',
        size: 4,
      },
    ];

    if (!this.isNew() && this.id()) {
      from(this.productApi.getProductById(this.id())).subscribe((product) => {
        this.product = signal(product);
        this.dynamicForm.form.patchValue(product);
        if (this.isConsult()) this.dynamicForm.form.disable();
      });
    }
  }

  protected async submit() {
    if (this.isNew()) {
      const data = await this.productApi.insertProduct(this.dynamicForm.form.getRawValue());
      if (data) {
        this.dynamicForm.form.reset();
        this.notificationService.success('Sucesso', 'Produto cadastrado com sucesso');
        this.router.navigate(['/', 'products', 'list']);
      }
    } else {
      const data = await this.productApi.updateProduct(this.id(), this.dynamicForm.form.getRawValue());
      if (data) {
        this.dynamicForm.form.reset();
        this.notificationService.success('Sucesso', 'Produto atualizado com sucesso');
        this.router.navigate(['/', 'products', 'list']);
      }
    }
  }
}
