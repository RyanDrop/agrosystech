import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzNotificationService } from 'ng-zorro-antd/notification';

import { injectSupabase } from './../../../../shared/functions/inject-supabase.function';
import { LoadingService } from './../../../../shared/services/loading/loading.service';
import { eDynamicField } from './../../../../widgets/components/dynamic-form/dynamic-field.enum';
import { DynamicFormConfig } from './../../../../widgets/components/dynamic-form/dynamic-form-config.interface';
import { DynamicFormComponent } from './../../../../widgets/components/dynamic-form/dynamic-form.component';

@Component({
  selector: 'agro-forgot-password',
  imports: [DynamicFormComponent, NzButtonComponent, NzFormModule, NzInputModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.page.html',
  styleUrl: './forgot-password.page.scss',
})
export class ForgotPasswordPage {
  private readonly supabase = injectSupabase();
  private readonly notificationService = inject(NzNotificationService);
  protected loadingService = inject(LoadingService);

  public formConfig: DynamicFormConfig[] = [
    {
      label: 'Email',
      name: 'email',
      type: {
        field: eDynamicField.INPUT,
        typeField: 'email',
      },
      validations: [Validators.required, Validators.email],
      size: 24,
    },
  ];

  @ViewChild(DynamicFormComponent) public dynamicForm!: DynamicFormComponent;

  public async submit() {
    this.loadingService.start();

    const { email } = this.dynamicForm.form.value;

    await this.supabase.auth.resetPasswordForEmail(email);
    this.notificationService.success('Email enviado', 'Verifique sua caixa de entrada');

    this.dynamicForm.form.reset();

    this.loadingService.stop();
  }
}
