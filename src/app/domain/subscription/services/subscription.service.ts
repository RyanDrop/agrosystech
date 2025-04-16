import { inject, Injectable, signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '@supabase/supabase-js';
import { NzMessageService } from 'ng-zorro-antd/message';

import { iUser } from '../../auth/interfaces/user.interface';
import { UserCompanyApi } from '../apis/user-company.api';
import { eSubscriptionStep } from '../enums/subscription-step.enum';
import { injectSupabase } from './../../../shared/functions/inject-supabase.function';
import { iCompany } from './../../../shared/interfaces/company.interface';
import { eUserStatus } from './../../auth/enums/user-status.enum';
import { AuthService } from './../../auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionService {
  private readonly authService = inject(AuthService);
  private readonly supabase = injectSupabase();
  private readonly messageService = inject(NzMessageService);
  private readonly userCompanyApi = inject(UserCompanyApi);
  private readonly router = inject(Router);

  public currentStep = signal<eSubscriptionStep>(eSubscriptionStep.ADMIN);

  public form = new FormGroup({
    admin: new FormGroup({
      name: new FormControl<string | null>(null),
      email: new FormControl<string | null>(null),
      phone: new FormControl<string | null>(null),
      password: new FormControl<string | null>(null),
    }),
    company: new FormGroup({
      name: new FormControl<string | null>(null),
      document: new FormControl<string | null>(null),
      zip_code: new FormControl<string | null>(null),
      street: new FormControl<string | null>(null),
      number: new FormControl<string | null>(null),
      complement: new FormControl<string | null>(null),
      neighborhood: new FormControl<string | null>(null),
      city: new FormControl<string | null>(null),
      state: new FormControl<string | null>(null),
      country: new FormControl<string | null>(null),
    }),
    plan: new FormGroup({
      price_id: new FormControl<string | null>(null),
    }),
  });

  public getAdminForm() {
    return this.form.get('admin') as FormGroup;
  }

  public getCompanyForm() {
    return this.form.get('company') as FormGroup;
  }

  public getPlanForm() {
    return this.form.get('plan') as FormGroup;
  }

  public async submit() {
    try {
      const user = await this.createAdminUser(this.getAdminForm());
      if (!user) throw new Error('Usuário não encontrado');
      const company = await this.createCompany(this.getCompanyForm(), user);
      await this.createSubscription(company.id);
      const { data: user_company } = await this.supabase.from('user_company').select('*').single();
      if (user_company) {
        localStorage.setItem('user_company', JSON.stringify(user_company));
      }
      this.router.navigate(['/']);
      this.form.reset();
    } catch (error: unknown) {
      if (error instanceof Error) this.messageService.error(error.message);
      else this.messageService.error('Erro ao criar assinatura');
    }
  }

  private async createAdminUser(adminForm: FormGroup) {
    const formValues = adminForm.getRawValue();
    const { name, email, phone, password } = formValues;

    const payload = {
      email: email,
      password: password,
      options: {
        data: {
          full_name: name,
        },
      },
    };

    const { error: signUpError } = await this.supabase.auth.signUp(payload);
    const { error } = await this.supabase.auth.signInWithPassword({ email, password });

    if (signUpError && signUpError.message !== 'User already registered' && error) throw new Error('Erro ao cadastrar usuário');

    if (error) {
      this.messageService.error('Verifique suas credenciais e tente novamente');
      return;
    }

    await this.authService.load();

    const newUser = this.authService.currentUser();
    if (!newUser) throw new Error('Usuário não encontrado');

    if (newUser?.phone && newUser?.status === eUserStatus.ACTIVE) return newUser;

    await this.authService.updateUser({ phone, status: eUserStatus.ACTIVE }, newUser.id);

    return newUser;
  }

  private async createCompany(companyForm: FormGroup, user: User | iUser) {
    const formValues = companyForm.getRawValue();
    const { name, document, zip_code, street, number, complement, neighborhood, city, state, country } = formValues;

    const payload = {
      name,
      document,
      address: {
        zip_code,
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        country,
      },
    };

    const { error } = await this.supabase.from('company').insert(payload).select('*').returns<iCompany>().single();
    if (error && !error.message.includes('violates unique constraint')) throw new Error('Erro ao cadastrar empresa');

    const { data: company, error: companyError } = await this.supabase
      .from('company')
      .select('*')
      .eq('document', document)
      .single();

    if (companyError) throw new Error('Empresa já cadastrada');

    const user_id = user.id;

    const userCompanyPayload = {
      company_id: company.id,
      user_id,
    };

    const { data: userCompany } = await this.userCompanyApi.select().eq('company_id', company.id).eq('user_id', user_id).single();
    if (userCompany) return company;

    const { error: userCompanyError } = await this.userCompanyApi.insert(userCompanyPayload);
    if (userCompanyError) throw new Error('Erro ao vincular usuário a empresa');

    return company;
  }

  private async createSubscription(company_id: string) {
    const { price_id } = this.getPlanForm().getRawValue();
    if (!price_id) throw new Error('O plano é obrigatório.');

    const user = this.authService.currentUser();
    if (!user) throw new Error('Usuário não encontrado');

    const payload = {
      company_id,
      price_id,
      name: user.fullname,
      email: user.email,
      phone: user.phone,
    };

    const { data, error } = await this.supabase.functions.invoke('create_subscription', {
      body: JSON.stringify(payload),
    });
    if (error) throw new Error('Erro ao cadastrar assinatura');

    return data;
  }
}
