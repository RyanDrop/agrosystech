import { Component, Inject, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { from } from 'rxjs';

import { CrudService } from '../interfaces/crud-service.interface';
import { LoadingService } from '../services/loading/loading.service';

@Component({
  template: '',
})
export abstract class BaseListComponent<T> implements OnInit, OnDestroy {
  protected readonly notificationService = inject(NzNotificationService);
  protected readonly loadingService = inject(LoadingService);
  protected readonly router = inject(Router);
  protected readonly isMobile = signal<boolean>(window.innerWidth < 600);
  protected readonly search = new FormControl('');

  protected pageIndex = 1;
  protected pageSize = 5;
  protected pageSizeOptions = [5, 10, 20, 50];
  protected total: number;
  protected listOfData: T[] = [];

  constructor(@Inject('CrudService') protected readonly crudService: CrudService<T>) {}

  public ngOnInit() {
    window.addEventListener('resize', this.handleResize);
    this.searchData();
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

  protected searchData(reset = false): void {
    this.loadingService.start();
    if (reset) this.pageIndex = 1;

    from(this.crudService.getPaginated(this.pageIndex, this.pageSize)).subscribe(
      (response) => {
        this.loadingService.stop();
        this.total = response?.count ?? 0;
        this.listOfData = response?.data as unknown as T[];
      },
      () => this.loadingService.loading.set(false),
    );
  }

  protected delete(id: string): void {
    this.loadingService.start();
    from(this.crudService.delete(id)).subscribe((response) => {
      if (response?.error) {
        this.notificationService.error('Erro', 'O registro não pode ser excluído', {
          nzDuration: 5000,
        });
      } else {
        this.notificationService.success('Sucesso', 'O registro foi excluído com sucesso', {
          nzDuration: 5000,
        });
      }
      this.searchData();
    });
  }
}
