import { Component, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { DynamicFormConfig } from 'src/app/widgets/components/dynamic-form/dynamic-form-config.interface';
import { DynamicFormComponent } from 'src/app/widgets/components/dynamic-form/dynamic-form.component';

import { LoadingService } from '../services/loading/loading.service';

@Component({
  template: '',
})
export class BaseListComponent implements OnInit, OnDestroy {
  protected readonly isMobile = signal<boolean>(window.innerWidth < 768);
  protected readonly router = inject(Router);
  protected isConsult = signal(false);
  protected isNew = signal(false);
  protected id = signal('');
  protected loadingService = inject(LoadingService);
  protected readonly notificationService = inject(NzNotificationService);

  @ViewChild(DynamicFormComponent) public dynamicForm!: DynamicFormComponent;

  protected dynamicFormConfig: DynamicFormConfig[];

  public ngOnInit() {
    window.addEventListener('resize', this.handleResize);
    const isConsult = this.router.url.split('/')[4] === 'consult';
    const id = this.router.url.split('/')[3] || '';
    const isNew = this.router.url.split('/')[4] === undefined;
    this.isConsult.set(isConsult);
    this.isNew.set(isNew);
    this.id.set(id);
    this.getData();
  }

  public getData() {
    // getdata
  }

  public ngOnDestroy() {
    window.removeEventListener('resize', this.handleResize);
  }

  protected navigateTo(route: string) {
    this.router.navigate([route]);
  }

  protected cancel(form: string) {
    this.router.navigate([form]);
  }

  private readonly handleResize = () => {
    this.isMobile.set(window.innerWidth < 768);
  };
}
