import { SelectionModel } from '@angular/cdk/collections';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';

import { LoadingService } from '../services/loading/loading.service';

@Component({
  template: '',
})
export abstract class BaseManagerComponent<T> implements OnInit, OnDestroy {
  protected readonly notificationService = inject(NzNotificationService);
  protected readonly loadingService = inject(LoadingService);
  protected readonly router = inject(Router);
  protected readonly modal = inject(NzModalService);
  protected readonly isMobile = signal<boolean>(window.innerWidth < 600);
  protected readonly showFilters = signal(true);
  protected readonly showCharts = signal(false);

  protected pageIndex = 1;
  protected pageSize = 10;
  protected pageSizeOptions = [5, 10, 20, 50, 100, 500];
  protected total: number;
  protected listOfData: T[] = [];
  protected selection = new SelectionModel<T>(true, []);

  public ngOnInit() {
    window.addEventListener('resize', this.handleResize);
  }

  public ngOnDestroy() {
    window.removeEventListener('resize', this.handleResize);
  }

  protected navigateTo(route: string) {
    window.open(route, '_blank');
  }

  private readonly handleResize = () => {
    this.isMobile.set(window.innerWidth < 600);
  };

  protected selectItem(item: T) {
    if (this.selection.isSelected(item)) this.selection.deselect(item);
    else this.selection.select(item);
  }

  protected selectAll(event: Event) {
    this.selection.clear();
    const target = event.srcElement as HTMLInputElement;
    if (target?.checked) this.selection.select(...this.listOfData);
  }
}
