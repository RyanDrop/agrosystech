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
export class FormProductsPage extends BaseListComponent implements AfterViewInit {
  protected isConsult = signal(false);
  protected isNew = signal(false);
  protected product: WritableSignal<iProduct>;

  public ngAfterViewInit(): void {
    const isConsult = this.router.url.split('/')[4] === 'consult';
    const isNew = this.router.url.split('/')[4] === undefined;
    this.isConsult.set(isConsult);
    this.isNew.set(isNew);

    const findOnLocalStorage = JSON.parse(localStorage.getItem('products') || '[]');
    if (findOnLocalStorage.length > 0) {
      const id = this.router.url.split('/')[3];
      if (id) {
        const product = findOnLocalStorage.find((product: any) => product.id == id);
        if (product) {
          this.dynamicForm.form.patchValue(product);
          this.product = signal(product);
          if (isConsult) {
            this.dynamicForm.form.disable();
          }
        }
      }
    }
  }

  @ViewChild(DynamicFormComponent) public dynamicForm!: DynamicFormComponent;

  public productConfig: DynamicFormConfig[] = [
    {
      label: 'Nome',
      name: 'name',
      type: {
        field: eDynamicField.INPUT,
        typeField: 'text',
      },
      validations: [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
      size: 24,
    },
  ];

  protected submit(form: string) {
    const currentForm = JSON.parse(localStorage.getItem(form) || '[]');
    if (this.isNew()) {
      localStorage.setItem('id', (+(localStorage.getItem('id') || 0) + 1).toString());
      const product = {
        id: localStorage.getItem('id'),
        ...this.dynamicForm.form.getRawValue(),
        lastOrder: new Date(),
      };

      currentForm.push(product);
      localStorage.setItem(form, JSON.stringify(currentForm));
    } else {
      const findIndex = currentForm.findIndex((product: any) => product.id == this.product().id);
      const product = {
        id: this.product().id,
        ...this.dynamicForm.form.getRawValue(),
      };
      currentForm[findIndex] = product;
      localStorage.setItem(form, JSON.stringify(currentForm));
    }

    this.dynamicForm.form.reset();
    this.router.navigate(['/', 'products', 'list']);
  }
}
