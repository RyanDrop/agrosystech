import { Component, Inject, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { debounceTime, from } from 'rxjs';

import { CrudService } from '../interfaces/crud-service.interface';
import { LoadingService } from '../services/loading/loading.service';

@Component({
  template: '',
})
export abstract class BaseListComponent<T> implements OnInit, OnDestroy {
  protected readonly notificationService = inject(NzNotificationService);
  protected readonly loadingService = inject(LoadingService);
  protected readonly router = inject(Router);
  protected readonly modal = inject(NzModalService);
  protected readonly isMobile = signal<boolean>(window.innerWidth < 600);
  protected readonly search = new FormControl('');

  protected columnSearch = 'name';
  protected pageIndex = 1;
  protected pageSize = 5;
  protected pageSizeOptions = [5, 10, 20, 50];
  protected total: number;
  protected listOfData: T[] = [];

  constructor(@Inject('CrudService') protected readonly crudService: CrudService<T>) {}

  public ngOnInit() {
    window.addEventListener('resize', this.handleResize);
    this.searchData();
    this.search.valueChanges.pipe(debounceTime(500)).subscribe(() => {
      this.searchData(true);
    });
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

    from(
      this.crudService.getPaginated(this.pageIndex, this.pageSize, undefined, undefined, undefined, {
        column: this.columnSearch,
        value: this.search.value || '',
      }),
    ).subscribe(
      (response) => {
        this.loadingService.stop();
        this.total = response?.count ?? 0;
        this.listOfData = response?.data as unknown as T[];
      },
      () => this.loadingService.loading.set(false),
    );
  }

  protected delete(id: string): void {
    this.modal.confirm({
      nzTitle: 'Atenção',
      nzContent: 'Deseja excluir o registro?',
      nzOkText: 'Sim',
      nzOkType: 'primary',
      nzOnOk: () => {
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
      },
    });
  }
}
