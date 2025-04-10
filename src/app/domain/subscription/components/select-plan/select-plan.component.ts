import { CurrencyPipe } from '@angular/common';
import { AfterViewInit, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { LoadingService } from './../../../../shared/services/loading/loading.service';
import { ProductsApi } from './../../../subscription/apis/products.api';
import { eSubscriptionStep } from './../../../subscription/enums/subscription-step.enum';
import { iPrice } from './../../../subscription/interfaces/price.interface';
import { iProduct } from './../../../subscription/interfaces/product.interface';
import { SubscriptionService } from './../../../subscription/services/subscription.service';

// eslint-disable-next-line @typescript-eslint/naming-convention
interface iProductWithPrice extends iProduct {
  price: iPrice | null;
}

@Component({
  imports: [
    CurrencyPipe,
    FormsModule,
    NzButtonModule,
    NzCardModule,
    NzFlexModule,
    NzIconModule,
    NzRadioModule,
    NzSpinModule,
    NzTagModule,
    NzTypographyModule,
    RouterModule,
  ],
  templateUrl: './select-plan.component.html',
})
export class SelectPlanComponent implements OnInit, AfterViewInit {
  private readonly productsApi = inject(ProductsApi);
  private readonly subscriptionService = inject(SubscriptionService);
  protected loadingService = inject(LoadingService);

  public selectedPrice = '';
  public products = signal<iProductWithPrice[]>([]);

  ngOnInit(): void {
    this.subscriptionService.currentStep.set(eSubscriptionStep.PLAN);

    this.load();
  }

  ngAfterViewInit(): void {
    const planForm = this.subscriptionService.getPlanForm();
    const price_id = planForm.get('price_id')?.value;

    if (price_id) this.selectedPrice = price_id;
  }

  public async load() {
    this.loadingService.start();

    const products = await this.productsApi.getAll();
    this.products.set(
      products.map((product: any) => {
        const price = product.prices ? product.prices[0] : null;
        return { ...product, price };
      }),
    );

    if (products.length > 0 && !this.selectedPrice) this.selectedPrice = this.products()[0].price?.id || '';

    this.loadingService.stop();
  }

  public changePlan(id?: string) {
    if (!id) return;

    this.selectedPrice = id;

    const planForm = this.subscriptionService.getPlanForm();
    planForm.get('price_id')?.setValue(id);
  }

  public async submit() {
    await this.subscriptionService.submit();
  }
}
