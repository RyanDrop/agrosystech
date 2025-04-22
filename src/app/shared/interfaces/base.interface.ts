// eslint-disable-next-line @typescript-eslint/naming-convention
export interface iBase {
  id: string;
  created_at: Date;
  created_by: string;
  updated_at: Date;
  updated_by: string;
  isActive: boolean;
}

type FilterOperator = 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in';

export interface ManagerFilter {
  column: string;
  operator?: FilterOperator;
  value: string | number | (string | number)[];
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
}
