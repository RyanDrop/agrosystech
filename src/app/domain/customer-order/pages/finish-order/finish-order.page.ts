import { Component } from '@angular/core';

@Component({
  imports: [],
  template: `
    <section>
      <h2 class="text-center">Pedido finalizado ou sem autorização de acesso</h2>
    </section>
  `,
  styles: [
    `
      section {
        height: calc(100vh - 170px);
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
})
export class FinishPage {}
