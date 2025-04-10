import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStepsModule } from 'ng-zorro-antd/steps';

import { FormStorageDirective } from './../../../../widgets/directives/form-storage/form-storage.directive';
import { SubscriptionService } from './../../../subscription/services/subscription.service';

@Component({
  selector: 'agro-subscription',
  imports: [NzCardModule, NzStepsModule, RouterModule, FormStorageDirective, ReactiveFormsModule],
  templateUrl: './subscription.page.html',
  styleUrl: './subscription.page.scss',
})
export class SubscriptionPage {
  protected subscriptionService = inject(SubscriptionService);
}
