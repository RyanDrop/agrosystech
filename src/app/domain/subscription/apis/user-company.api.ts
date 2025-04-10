import { Injectable } from '@angular/core';

import { iUserCompany } from '../interfaces/user-company.interface';
import { BaseApi } from './../../../shared/apis/base.api';

@Injectable({
  providedIn: 'root',
})
export class UserCompanyApi extends BaseApi<iUserCompany> {
  constructor() {
    super('user_company');
  }
}
