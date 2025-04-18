import { Component, Inject, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { DynamicFormConfig } from 'src/app/widgets/components/dynamic-form/dynamic-form-config.interface';
import { DynamicFormComponent } from 'src/app/widgets/components/dynamic-form/dynamic-form.component';

import { CrudService } from '../interfaces/crud-service.interface';
import { LoadingService } from '../services/loading/loading.service';

@Component({
  template: '',
})
export abstract class BaseFormComponent<T> implements OnInit, OnDestroy {
  protected readonly notificationService = inject(NzNotificationService);
  protected readonly loadingService = inject(LoadingService);
  protected readonly router = inject(Router);
  protected readonly isMobile = signal<boolean>(window.innerWidth < 600);
  protected readonly isConsult = signal(false);
  protected readonly isNew = signal(false);
  protected readonly id = signal('');

  constructor(@Inject('CrudService') protected readonly crudService: CrudService<T>) {}

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
    this.isMobile.set(window.innerWidth < 600);
  };
}
