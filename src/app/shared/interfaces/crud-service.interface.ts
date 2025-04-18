import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

export interface Paginate<T> {
  data: T[];
  count: number;
  page: number;
}

export interface CrudService<T> {
  getAll(columns?: string): Promise<T[]>;
  getDataById(id: string): Promise<T>;
  getPaginated(pageIndex: number, pageSize: number, columns?: string): Promise<Paginate<T>>;
  delete(id: string): PostgrestFilterBuilder<any, any, null, string, unknown>;
  create(payload: T): Promise<T>;
  updateData(id: string, payload: T): Promise<T>;
}
