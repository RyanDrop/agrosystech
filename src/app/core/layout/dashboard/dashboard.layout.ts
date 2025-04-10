import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';

import { SidebarComponent } from './../../components/sidebar.component';

@Component({
  selector: 'agro-dashboard',
  imports: [RouterModule, NzLayoutModule, SidebarComponent],
  template: `
    <nz-layout>
      <nz-sider [class.opened]="isOpened()">
        <agro-sidebar (isOpenedChange)="isOpened.set($event)" [isMobile]="isMobile()" />
      </nz-sider>
      <nz-layout>
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
