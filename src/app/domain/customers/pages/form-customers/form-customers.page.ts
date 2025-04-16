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
import { AgroCustomerApi } from '../../apis/customers.api';
import { iCustomers } from '../../interfaces/customers.interface';

@Component({
  selector: 'agro-form-customers',
  imports: [
    DynamicFormComponent,
    NzButtonComponent,
    NzFlexModule,
    NzFormModule,
    NzInputModule,
    ReactiveFormsModule,
    NzDividerModule,
  ],
  templateUrl: './form-customers.page.html',
  styleUrl: './form-customers.page.scss',
})
export class FormCustomersPage extends BaseListComponent {
  protected customer: WritableSignal<iCustomers>;
  private readonly customersApi = inject(AgroCustomerApi);

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
        size: 8,
        placeholder: 'Digite o nome do cliente',
      },
      {
        label: 'E-mail',
        name: 'email',
        type: {
          field: eDynamicField.INPUT,
          typeField: 'email',
        },
        validations: [Validators.email, Validators.maxLength(255)],
        size: 7,
        placeholder: 'Digite o e-mail do cliente',
      },
      {
        label: 'Telefone',
        name: 'phone',
        type: {
          field: eDynamicField.INPUT,
          typeField: 'tel',
        },
        mask: '(00) 00000-0000||(00) 0000-0000',
        validations: [],
        size: 7,
        placeholder: 'Digite o telefone/celular do cliente',
      },
      {
        label: 'Ativo',
        name: 'active',
        type: {
          field: eDynamicField.CHECKBOX,
          typeField: 'boolean',
        },
        validations: [],
        size: 2,
      },
    ];

    if (!this.isNew() && this.id()) {
      from(this.customersApi.getCustomerById(this.id())).subscribe((customer) => {
        this.customer = signal(customer);
        this.dynamicForm.form.patchValue(customer);
        if (this.isConsult()) this.dynamicForm.form.disable();
      });
    }
  }

  protected async submit() {
    if (this.isNew()) {
      const data = await this.customersApi.insertCustomer(this.dynamicForm.form.getRawValue());
      if (data) {
        this.dynamicForm.form.reset();
        this.notificationService.success('Sucesso', 'Cliente cadastrado com sucesso');
        this.router.navigate(['/', 'customers', 'list']);
      }
    } else {
      const data = await this.customersApi.updateCustomer(this.id(), this.dynamicForm.form.getRawValue());
      if (data) {
        this.dynamicForm.form.reset();
        this.notificationService.success('Sucesso', 'Cliente atualizado com sucesso');
        this.router.navigate(['/', 'customers', 'list']);
      }
    }
  }
}
