import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzListModule } from 'ng-zorro-antd/list';

export interface SidebarItem {
  title: string;
  href: string;
  icon: string;
}
@Component({
  selector: 'agro-sidebar',
  imports: [CommonModule, NzListModule, NzIconModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  protected readonly isOpened = signal<boolean>(false);
  protected readonly isLoading = signal(false);
  public readonly isMobile = input<boolean>(window.innerWidth < 768);

  public readonly isOpenedChange = output<boolean>();

  private readonly router = inject(Router);

  protected readonly computedIsOpen = computed(() => {
    const isOpened = this.isOpened();
    this.isOpenedChange.emit(isOpened);
    return isOpened;
  });

  protected listData: SidebarItem[] = [
    {
      title: 'Clientes',
      href: '/customers',
      icon: 'user',
    },
    {
      title: 'Produtos',
      href: '/products',
      icon: 'shop',
    },
    {
      title: 'Pedidos',
      href: '/purchase-orders',
      icon: 'file-done',
    },
  ];

  protected navigateTo(item: SidebarItem) {
    this.router.navigate([item.href]);
  }
}
