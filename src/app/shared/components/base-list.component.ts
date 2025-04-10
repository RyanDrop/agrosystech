import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  template: '',
})
export class BaseListComponent implements OnInit, OnDestroy {
  protected readonly isMobile = signal<boolean>(window.innerWidth < 768);
  protected readonly router = inject(Router);

  public ngOnInit() {
    window.addEventListener('resize', this.handleResize);
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
