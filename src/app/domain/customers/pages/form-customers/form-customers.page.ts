import { AfterViewInit, Component, signal, ViewChild, WritableSignal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';

import { BaseListComponent } from '../../../../shared/components/base-list.component';
import { eDynamicField } from '../../../../widgets/components/dynamic-form/dynamic-field.enum';
import { DynamicFormConfig } from '../../../../widgets/components/dynamic-form/dynamic-form-config.interface';
import { DynamicFormComponent } from '../../../../widgets/components/dynamic-form/dynamic-form.component';
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
export class FormCustomersPage extends BaseListComponent implements AfterViewInit {
  protected isConsult = signal(false);
  protected isNew = signal(false);
  protected customer: WritableSignal<iCustomers>;

  public ngAfterViewInit(): void {
    const isConsult = this.router.url.split('/')[4] === 'consult';
    const isNew = this.router.url.split('/')[4] === undefined;
    this.isConsult.set(isConsult);
    this.isNew.set(isNew);

    const findOnLocalStorage = JSON.parse(localStorage.getItem('customers') || '[]');
    if (findOnLocalStorage.length > 0) {
      const id = this.router.url.split('/')[3];
      if (id) {
        const customer = findOnLocalStorage.find((customer: any) => customer.id == id);
        if (customer) {
          this.dynamicForm.form.patchValue(customer);
          this.customer = signal(customer);
          if (isConsult) {
            this.dynamicForm.form.disable();
          }
        }
      }
    }
  }

  @ViewChild(DynamicFormComponent) public dynamicForm!: DynamicFormComponent;

  public customerConfig: DynamicFormConfig[] = [
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
      size: 8,
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
      size: 8,
      placeholder: 'Digite o telefone/celular do cliente',
    },
  ];

  protected submit(form: string) {
    const currentForm = JSON.parse(localStorage.getItem(form) || '[]');
    if (this.isNew()) {
      localStorage.setItem('id', (+(localStorage.getItem('id') || 0) + 1).toString());
      const customer = {
        id: localStorage.getItem('id'),
        ...this.dynamicForm.form.getRawValue(),
        lastOrder: new Date(),
      };

      currentForm.push(customer);
      localStorage.setItem(form, JSON.stringify(currentForm));
    } else {
      const findIndex = currentForm.findIndex((customer: any) => customer.id == this.customer().id);
      const customer = {
        id: this.customer().id,
        ...this.dynamicForm.form.getRawValue(),
        lastOrder: new Date(),
      };
      currentForm[findIndex] = customer;
      localStorage.setItem(form, JSON.stringify(currentForm));
    }

    this.dynamicForm.form.reset();
    this.router.navigate(['/', 'customers', 'list']);
  }
}
