import { Component, inject, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { AgroCustomerApi } from 'src/app/domain/customers/apis/customers.api';
import { ORDER_STATUS } from 'src/app/domain/purchase-orders/constants/purchase-orders.constants';
import { BaseManagerComponent } from 'src/app/shared/components/base-manager.component';
import { convertDateRangeToISO } from 'src/app/shared/functions/convert-date-range-to-iso.function';
import { generatePDFByOrders, manyOrderPdf } from 'src/app/shared/functions/order-pdf.function';
import { ManagerFilter } from 'src/app/shared/interfaces/base.interface';
/* eslint-disable @typescript-eslint/naming-convention */
import { CommonModule } from '@angular/common';
import { asyncScheduler, catchError, from, of, scheduled } from 'rxjs';

import { eProductPackage } from 'src/app/domain/products/enums/products.enums';
import { calcQuantityPerPackageFromPedidos } from 'src/app/shared/functions/calc-packges.function';
import { CountPackagesPipe } from 'src/app/shared/pipes/count-packages.pipe';
import { AgroManagerPurchaseOrdersApi } from '../../apis/manager-purchase-orders.api';
import { iOrder } from '../../interfaces/purchase-orders.interface';

@Component({
  selector: 'agro-manager-orders',
  imports: [
    NzTableModule,
    NzDividerModule,
    CommonModule,
    NzIconModule,
    NzToolTipModule,
    NzFormModule,
    NzInputModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzPaginationModule,
    NzSelectModule,
    NzSpinModule,
    NzDatePickerModule,
    NzLayoutModule,
    NgApexchartsModule,
    NzCheckboxModule,
    CountPackagesPipe,
  ],
  templateUrl: './manager-purchase-orders.page.html',
  styleUrl: './manager-purchase-orders.page.scss',
})
export class ManagerPurchaseOrdersPage extends BaseManagerComponent<iOrder> {
  protected readonly clientesControl = new FormControl<string[]>([]);
  protected readonly statusControl = new FormControl<string[]>([]);
  protected readonly dateRange = new FormControl<string[]>([]);
  private readonly managerPurchaseOrdersApi = inject(AgroManagerPurchaseOrdersApi);
  private readonly customersApi = inject(AgroCustomerApi);

  protected optionList: { name: string; id: string }[] = [];
  protected indexCustomer = 1;
  protected pageCustomer = 10;
  protected totalCustomer = 100;
  protected readonly orderStatus = ORDER_STATUS;
  @ViewChild('chart') protected chart: ChartComponent;
  protected topProductsOptions: any;
  protected salesByCustomerOptions: any;
  protected salesEvolutionOptions: any;
  protected totalAccumulated: string;

  constructor() {
    super();
    this.loadMore();
  }

  protected getRandomNameList() {
    return from(this.customersApi.getPaginated(this.indexCustomer, this.pageCustomer, 'id, name')).pipe(
      catchError(() => of({ data: [], count: 0, page: 0 })),
    );
  }

  protected loadMore() {
    if (this.indexCustomer === 0) return;
    this.loadingService.start();
    this.getRandomNameList().subscribe((response) => {
      this.loadingService.stop();
      const data = response.data;
      this.totalCustomer = response.count;
      this.optionList = [...this.optionList, ...data];
      this.indexCustomer = response.count > this.optionList.length ? this.indexCustomer + 1 : 0;
    });
  }

  protected filter() {
    this.selection.clear();
    this.loadingService.start();
    this.totalAccumulated = '';
    const filters = [];
    const dateRange = this.dateRange.value;
    const clientes = this.clientesControl.value;

    if (dateRange && dateRange.length > 0) {
      const { startISO, endISO } = convertDateRangeToISO(dateRange);
      filters.push({ column: 'order_date', operator: 'gte', value: startISO });
      filters.push({ column: 'order_date', operator: 'lte', value: endISO });
    }

    if (clientes && clientes.length > 0) filters.push({ column: 'customer_id', operator: 'in', value: clientes });

    if (this.statusControl.value && this.statusControl.value.length > 0)
      filters.push({ column: 'status', operator: 'in', value: this.statusControl.value });

    from(
      this.managerPurchaseOrdersApi.getPaginateManager(
        this.pageIndex,
        this.pageSize,
        '*, agro_customers(name)',
        'order_date',
        'desc',
        filters as ManagerFilter[],
      ),
    ).subscribe(
      (response) => {
        this.listOfData = response.data;
        this.total = response.count;
        this.loadingService.stop();
        this.prepareTopProductsChart();
        this.prepareSalesEvolutionChart();
        this.prepareSalesByCustomerChart();
      },
      () => this.loadingService.stop(),
    );
  }

  protected exportPdf() {
    if (this.selection.selected.length === 0) return;
    manyOrderPdf(this.selection.selected);
  }

  protected exportPdfForTotals() {
    if (this.selection.selected.length === 0) return;
    generatePDFByOrders(this.selection.selected);
  }

  protected override selectItem(item: iOrder) {
    super.selectItem(item);
    this.calcTotalAccumulated();
  }

  protected override selectAll(event: Event) {
    super.selectAll(event);
    this.calcTotalAccumulated();
  }

  private calcTotalAccumulated() {
    if (this.selection.selected.length === 0) {
      this.totalAccumulated = '';
      return;
    }
    const totalPackages = calcQuantityPerPackageFromPedidos(this.selection.selected);

    const totalValue = this.selection.selected.reduce((acc, order) => acc + order.total_amount, 0);

    this.totalAccumulated = `Total: ${totalValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })} | ${totalPackages[eProductPackage.CAIXA]} ${eProductPackage.CAIXA} - ${totalPackages[eProductPackage.CAIXA_PAPELAO]} ${
      eProductPackage.CAIXA_PAPELAO
    } - ${totalPackages[eProductPackage.CAIXA_MADEIRA]} ${eProductPackage.CAIXA_MADEIRA} - ${
      totalPackages[eProductPackage.UNIDADE]
    } ${eProductPackage.UNIDADE} - ${totalPackages[eProductPackage.BANDEIJA]} ${eProductPackage.BANDEIJA} - ${
      totalPackages[eProductPackage.SACO]
    } ${eProductPackage.SACO}`;
  }

  protected markAsPaid() {
    if (this.selection.selected.length === 0) return;
    this.loadingService.start();
    const ids = this.selection.selected.map((item) => item.id);
    scheduled(this.managerPurchaseOrdersApi.markAsPaid(ids), asyncScheduler).subscribe(
      (response) => {
        if (response) {
          this.loadingService.stop();
          this.notificationService.success('Sucesso', 'Pedidos marcados como pagos');
          this.filter();
        }
      },
      () => this.loadingService.stop(),
    );
  }

  private prepareTopProductsChart() {
    // 1. Agrega quantidade por produto
    const qtyByProduct = new Map<string, number>();
    this.listOfData.forEach((order) =>
      order.products_ordered.forEach((prod) => {
        const q = prod.quantity || 0;
        qtyByProduct.set(prod.name, (qtyByProduct.get(prod.name) || 0) + +q);
      }),
    );

    // 2. Ordena e pega top 5
    const sorted = Array.from(qtyByProduct.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const categories = sorted.map((item) => item[0]);
    const data = sorted.map((item) => item[1]);

    // 3. Monta opções do gráfico de barras
    this.topProductsOptions = {
      series: [
        {
          name: 'Qtd Vendida',
          data,
        },
      ],
      chart: {
        type: 'bar',
        height: 350,
      },
      colors: ['#82c25e', '#e0342a', '#178', '#da0', '#ad1'],
      title: {
        text: 'Top 5 Produtos Mais Vendidos',
      },
      subtitle: {
        text: 'Quantidade total baseada no filtro',
      },
      xaxis: {
        categories,
      },
      yaxis: {
        title: { text: 'Quantidade' },
      },
      dataLabels: {
        enabled: true,
        style: {
          colors: ['#000000'],
        },
      },
      legend: {
        position: 'top',
      },
      stroke: {
        width: 1,
      },
      labels: categories,
      plotOptions: {
        bar: {
          distributed: true, // cada barra com cor diferente
        },
      },
    };
  }

  private prepareSalesEvolutionChart() {
    // 1. Agrupa valor total por dia (formato dd/MM)
    const salesByDay = new Map<string, number>();
    this.listOfData.forEach(({ order_date, total_amount }) => {
      const d = new Date(order_date);
      const dayKey = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      salesByDay.set(dayKey, (salesByDay.get(dayKey) || 0) + total_amount);
    });

    // 2. Ordena por data
    const sorted = Array.from(salesByDay.entries()).sort((a, b) => {
      const [da, ma] = a[0].split('/').map((n) => +n);
      const [db, mb] = b[0].split('/').map((n) => +n);
      return ma - mb || da - db;
    });

    const categories = sorted.map((item) => item[0]);
    const data = sorted.map((item) => item[1]);

    // 3. Monta opções do gráfico de linha
    this.salesEvolutionOptions = {
      series: [
        {
          name: 'R$ Vendas',
          data,
        },
      ],
      chart: {
        type: 'line',
        height: 350,
      },
      title: {
        text: 'Evolução Diário de Vendas',
      },
      subtitle: {
        text: 'Total faturado por dia',
      },
      xaxis: {
        categories,
      },
      yaxis: {
        title: { text: 'Valor (R$)' },
      },
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      dataLabels: {
        enabled: false,
        style: {
          colors: ['#000000'],
        },
      },
      labels: categories,
      legend: {
        position: 'top',
      },
      colors: ['#82c25e'], // cor da linha
    };
  }

  private prepareSalesByCustomerChart() {
    // 1) Agrega total de vendas por cliente
    const salesByCust = new Map<string, number>();
    this.listOfData.forEach((order) => {
      const custName = order['agro_customers']?.name || 'Desconhecido';
      salesByCust.set(custName, (salesByCust.get(custName) || 0) + order.total_amount);
    });

    // 2) Ordena decrescente e pega top 5 (ou comente slice pra mostrar todos)
    const sorted = Array.from(salesByCust.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const categories = sorted.map((item) => item[0]);
    const data = sorted.map((item) => item[1]);

    // 3) Configurações do gráfico de barras por cliente
    this.salesByCustomerOptions = {
      series: [
        {
          name: 'R$ Vendido',
          data,
        },
      ],
      chart: {
        type: 'bar',
        height: 350,
      },
      title: {
        text: 'Top 5 Clientes por Valor Vendido',
      },
      subtitle: {
        text: 'Total faturado',
      },
      xaxis: {
        categories,
        title: { text: 'Cliente' },
      },
      yaxis: {
        title: { text: 'Valor (R$)' },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: { toLocaleString: (arg0: string, arg1: { style: string; currency: string }) => any }) =>
          val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        style: {
          colors: ['#000000'],
        },
      },
      colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0'],
      plotOptions: {
        bar: {
          distributed: true, // cada barra com cor diferente
        },
      },
    };
  }
}
