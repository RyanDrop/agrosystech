import { Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzNotificationService } from 'ng-zorro-antd/notification';

import { injectSupabase } from './../../../shared/functions/inject-supabase.function';

@Component({
  selector: 'agro-reset-password',
  imports: [NzButtonComponent, NzFormModule, NzInputModule, FormsModule, RouterModule, ReactiveFormsModule],
  templateUrl: './reset-password.page.html',
  styleUrl: './reset-password.page.scss',
})
export class ResetPasswordPage {
  private readonly supabase = injectSupabase();
  private readonly notificationService = inject(NzNotificationService);
  private readonly router = inject(Router);

  public password = new FormControl(null, [Validators.required, Validators.minLength(6), Validators.maxLength(32)]);

  public async submit() {
    await this.supabase.auth.updateUser({ password: this.password.value || '' });
    this.notificationService.success('Senha alterada', 'Sua senha foi alterada com sucesso');

    this.password.reset();

    this.router.navigate(['/']);
  }
}
