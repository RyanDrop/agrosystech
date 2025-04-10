import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { debounceTime } from 'rxjs';

import { DynamicFormConfig } from './../../../../widgets/components/dynamic-form/dynamic-form-config.interface';
import { DynamicFormComponent } from './../../../../widgets/components/dynamic-form/dynamic-form.component';
import { COMPANY_FORM_CONFIG } from './../../..//subscription/constants/company-form-config.constant';
import { eSubscriptionStep } from './../../../subscription/enums/subscription-step.enum';
import { SubscriptionService } from './../../../subscription/services/subscription.service';

@UntilDestroy()
@Component({
  imports: [DynamicFormComponent, NzButtonModule, NzFlexModule, NzIconModule, NzTypographyModule, RouterModule],
  templateUrl: './company-details.component.html',
})
export class CompanyDetailsComponent implements OnInit, AfterViewInit {
  private readonly subscriptionService = inject(SubscriptionService);

  public formConfig: DynamicFormConfig[] = COMPANY_FORM_CONFIG();

  @ViewChild(DynamicFormComponent) public dynamicForm!: DynamicFormComponent;

  ngOnInit(): void {
    this.subscriptionService.currentStep.set(eSubscriptionStep.COMPANY);
  }

  ngAfterViewInit(): void {
    this.dynamicForm?.form.statusChanges.pipe(untilDestroyed(this), debounceTime(300)).subscribe(() => {
      const form = this.subscriptionService.getCompanyForm();
      form.patchValue(this.dynamicForm.form.getRawValue());
    });

    this.dynamicForm.form.patchValue(this.subscriptionService.getCompanyForm().getRawValue());
  }

  public submit() {
    this.subscriptionService.submit();
  }
}
