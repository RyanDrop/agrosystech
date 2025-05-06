import { inject, Injectable } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
/* eslint-disable @typescript-eslint/naming-convention */
import { HttpClient } from '@angular/common/http';

import { AuthService } from './../../domain/auth/services/auth.service';
import { injectSupabase } from './../functions/inject-supabase.function';
import { iBase, ManagerFilter } from './../interfaces/base.interface';

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
    return this.supabase.from(this.tableName).select('*, agro_customers(name)').eq('id', id).single();
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

  public async selectPaginate<T>(
    select = '*',
    pageIndex: number,
    pageSize: number,
    columnFromOrderBy = 'name',
    orderBy: 'asc' | 'desc' = 'asc',
    search?: { column: string; value: string },
  ) {
    const { from, to } = this.getPagination(pageIndex, pageSize);
    const { data, count } = await this.supabase
      .from(this.tableName)
      .select(select, { count: 'exact' })
      .order(columnFromOrderBy, { ascending: orderBy === 'asc' })
      .like(search?.column || 'name', `%${search?.value || ''}%`)
      .range(from, to);

    return {
      data: data as unknown as T[],
      count: count ?? 0,
      page: +pageIndex,
    };
  }

  public async selectPaginateManager<T>(
    select = '*',
    pageIndex: number,
    pageSize: number,
    columnFromOrderBy = 'name',
    orderBy: 'asc' | 'desc' = 'asc',
    filters?: ManagerFilter[],
  ) {
    const { from, to } = this.getPagination(pageIndex, pageSize);

    let query = this.supabase.from(this.tableName).select(select, { count: 'exact' });

    if (filters && filters.length) {
      filters.forEach(({ column, operator = 'eq', value }) => {
        switch (operator) {
          case 'in':
            if (Array.isArray(value)) {
              query = query.in(column, value as (string | number)[]);
            } else {
              throw new Error(`Para 'in', passe um array em value.`);
            }
            break;

          case 'gte':
            query = query.gte(column, value as string | number);
            break;

          case 'lte':
            query = query.lte(column, value as string | number);
            break;

          case 'gt':
            query = query.gt(column, value as string | number);
            break;

          case 'lt':
            query = query.lt(column, value as string | number);
            break;

          case 'neq':
            query = query.neq(column, value as string | number);
            break;

          case 'eq':
          default:
            query = query.eq(column, value as string | number);
            break;
        }
      });
    }
    const { data, count, error } = await query.order(columnFromOrderBy, { ascending: orderBy === 'asc' }).range(from, to);

    if (error) {
      throw error;
    }

    return {
      data: data as unknown as T[],
      count: count ?? 0,
      page: pageIndex,
    };
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

  private getPagination(page: number, size: number) {
    const limit = size ? size : 10;
    const from = page ? (page - 1) * limit : 0;
    const to = page ? from + size - 1 : size - 1;

    return { from, to };
  }
}
