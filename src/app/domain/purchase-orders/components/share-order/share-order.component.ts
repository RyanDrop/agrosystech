import { Clipboard } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

@Component({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzToolTipModule,
  ],
  templateUrl: './share-order.component.html',
})
export class ShareOrderComponent {
  private readonly modal = inject(NzModalRef);
  private readonly nzModalData = inject(NZ_MODAL_DATA);
  private readonly clipboard = inject(Clipboard);
  protected readonly notificationService = inject(NzNotificationService);

  protected submit() {
    this.modal.close(true);
  }

  protected copyLink() {
    const isCopied = this.clipboard.copy(
      `${window.location.href.split('/purchase-orders/')[0]}/customer-order/new/${this.nzModalData.id}`,
    );

    if (isCopied) {
      this.notificationService.success('Sucesso', 'Link copiado para a área de transferência.');
    }
  }
}
