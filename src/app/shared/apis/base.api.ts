import { inject, Injectable } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
/* eslint-disable @typescript-eslint/naming-convention */
import { HttpClient } from '@angular/common/http';

import { AuthService } from './../../domain/auth/services/auth.service';
import { injectSupabase } from './../functions/inject-supabase.function';
import { iBase } from './../interfaces/base.interface';

@Injectable({
  providedIn: 'root',
})
export abstract class BaseApi<T extends Partial<iBase>> {
  private readonly authService = inject(AuthService);
  protected readonly notificationService = inject(NzNotificationService);
  protected http = inject(HttpClient);

  public supabase = injectSupabase();

  constructor(protected tableName: string) {}

  public getById(id: string) {
    return this.supabase.from(this.tableName).select('*').eq('id', id).single();
  }

  public select(
    select = '*',
    options: { isAscending?: boolean; active?: boolean; orderByCreatedAt?: boolean } = {
      isAscending: true,
      orderByCreatedAt: true,
    },
  ) {
    if (options.isAscending === undefined) options.isAscending = true;

    let query = this.supabase.from(this.tableName).select(select, { count: 'exact' });

    if (options.orderByCreatedAt) {
      query = query.order('created_at', { ascending: options.isAscending });
    }

    return query;
  }

  public insertOrUpdate(payload: T) {
    return payload.id ? this.update(payload).eq('id', payload.id) : this.insert(payload);
  }

  public insert(payload: Omit<T, keyof iBase>) {
    return this.supabase
      .from(this.tableName)
      .insert({ ...payload, created_by: this.authService.currentUser()?.id, active: true });
  }

  public insertMany(payload: Omit<T, keyof iBase>[]) {
    return this.supabase.from(this.tableName).insert(
      payload.map((item) => {
        return { ...item, created_by: this.authService.currentUser()?.id, active: true };
      }),
    );
  }

  public update(payload: Partial<T>) {
    payload.updated_by = this.authService.currentUser()?.id;
    payload.updated_at = new Date();

    return this.supabase.from(this.tableName).update([payload]).eq('id', payload.id);
  }

  public deleteById(id: string, columnName = 'id') {
    return this.supabase.from(this.tableName).delete().eq(columnName, id);
  }

  public inactiveById(id: string, columnName = 'id') {
    return this.supabase.from(this.tableName).update({ active: false }).eq(columnName, id);
  }

  public inactiveByIds(ids: string[], columnName = 'id') {
    return this.supabase.from(this.tableName).update({ active: false }).in(columnName, ids);
  }

  public async getUserCompany() {
    let user_company = JSON.parse(localStorage.getItem('user_company') || '{}');

    if (!user_company.company_id) {
      const { data } = await this.supabase.from('user_company').select('*').single();
      if (data) {
        localStorage.setItem('user_company', JSON.stringify(data));
        user_company = JSON.parse(localStorage.getItem('user_company') || '{}');
      }
    }
    return user_company;
  }
}
