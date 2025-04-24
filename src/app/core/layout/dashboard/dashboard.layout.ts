import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { SidebarComponent } from './../../components/sidebar.component';

@Component({
  selector: 'agro-dashboard',
  imports: [RouterModule, NzLayoutModule, SidebarComponent, NzIconModule, NzToolTipModule],
  template: `
    <nz-layout>
      <nz-sider [class.opened]="isOpened()">
        <agro-sidebar (isOpenedChange)="isOpened.set($event)" [isMobile]="isMobile()" />
      </nz-sider>
      <nz-layout>
        <nav>
          <i
            nz-icon
            nzType="logout"
            nzTheme="outline"
            nz-tooltip
            nzTooltipTitle="Sair"
            tabindex="0"
            (click)="logout()"
            (keydown)="handleKeydown($event)"
          ></i>
        </nav>
        @if (isOpened() && isMobile()) {
        } @else {
          <nz-content>
            <router-outlet />
          </nz-content>
        }
      </nz-layout>
    </nz-layout>
  `,
  styleUrl: './dashboard.layout.scss',
})
export class DashboardLayout implements OnInit, OnDestroy {
  protected isOpened = signal<boolean>(true);
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

  protected handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.logout();
      event.preventDefault();
    }
  }

  protected logout() {
    this.modal.confirm({
      nzTitle: 'Deseja realmente sair?',
      nzOkText: 'Sim',
      nzCancelText: 'Não',
      nzOnOk: () => {
        localStorage.clear();
        window.location.href = '/auth';
      },
    });
  }
}
