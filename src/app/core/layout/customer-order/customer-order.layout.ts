import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'agro-dashboard',
  imports: [RouterModule, NzLayoutModule],
  template: `
    <nz-layout>
      <header><img [src]="'assets/images/logo-text.png'" alt="Agrosystech Logo" /></header>
      <nz-content>
        <router-outlet />
      </nz-content>
    </nz-layout>
  `,
  styleUrl: './customer-order.layout.scss',
})
export class CustomerOrderLayout implements OnInit, OnDestroy {
  protected isMobile = signal<boolean>(window.innerWidth < 768);
  protected readonly modal = inject(NzModalService);

  public ngOnInit() {
    window.addEventListener('resize', this.handleResize);
  }
  public ngOnDestroy() {
    window.removeEventListener('resize', this.handleResize);
  }

  private readonly handleResize = () => {
    this.isMobile.set(window.innerWidth < 768);
  };
}
