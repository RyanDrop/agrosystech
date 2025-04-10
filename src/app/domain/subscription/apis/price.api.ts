import { Injectable } from '@angular/core';

import { iPrice } from '../interfaces/price.interface';
import { BaseApi } from './../../../shared/apis/base.api';

@Injectable({
  providedIn: 'root',
})
export class PriceApi extends BaseApi<iPrice> {
  constructor() {
    super('prices');
  }
}
