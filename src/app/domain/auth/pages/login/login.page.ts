import { Component, inject, ViewChild } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzNotificationService } from 'ng-zorro-antd/notification';

import { injectSupabase } from './../../../../shared/functions/inject-supabase.function';
import { eDynamicField } from './../../../../widgets/components/dynamic-form/dynamic-field.enum';
import { DynamicFormConfig } from './../../../../widgets/components/dynamic-form/dynamic-form-config.interface';
import { DynamicFormComponent } from './../../../../widgets/components/dynamic-form/dynamic-form.component';

@Component({
  selector: 'agro-login',
  imports: [
    DynamicFormComponent,
    NzButtonComponent,
    NzFlexModule,
    NzFormModule,
    NzInputModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  private readonly supabase = injectSupabase();
  private readonly notificationService = inject(NzNotificationService);
  private readonly router = inject(Router);

  public loginConfig: DynamicFormConfig[] = [
    {
      label: 'Email',
      name: 'email',
      type: {
        field: eDynamicField.INPUT,
        typeField: 'email',
      },
      validations: [Validators.required, Validators.email, Validators.maxLength(255)],
      size: 24,
    },
    {
      label: 'Senha',
      name: 'password',
      type: {
        field: eDynamicField.INPUT,
        typeField: 'password',
      },
      showForgotPassword: true,
      forgotPasswordLink: 'forgot-password',
      validations: [Validators.required, Validators.minLength(8), Validators.maxLength(32)],
      size: 24,
    },
  ];

  @ViewChild(DynamicFormComponent) public dynamicForm?: DynamicFormComponent;

  public async login() {
    if (!this.dynamicForm?.form.valid) {
      this.notificationService.error('Erro', 'Preencha os campos corretamente');
      return;
    }

    const { email, password } = this.dynamicForm.form.value;
    const { error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) {
      this.notificationService.error('Erro ao fazer login', 'Verifique suas credenciais e tente novamente');
      return;
    }

    const { data: user_company } = await this.supabase.from('user_company').select('*').single();
    if (user_company) {
      localStorage.setItem('user_company', JSON.stringify(user_company));
    }

    this.router.navigate(['/']);
  }
}
