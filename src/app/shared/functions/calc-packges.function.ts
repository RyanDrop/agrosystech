import { eProductPackage } from 'src/app/domain/products/enums/products.enums';
import { iOrder } from 'src/app/domain/purchase-orders/interfaces/purchase-orders.interface';

type Product = {
  package: string;
  quantity: number | string;
};

type Pedido = {
  productsOrdered: Product[];
};

export function calcQuantityPerPackageFromPedidos(pedidos: iOrder[]) {
  return pedidos.reduce(
    (acc, pedido) => {
      pedido.products_ordered.forEach((product) => {
        const pkg = product.package;
        const quantity =
          typeof +(product.quantity || 0) === 'number' && !isNaN(+(product.quantity || 0)) ? +(product.quantity || 0) : 0;

        if (pkg in acc) {
          acc[pkg] += quantity;
        }
      });
      return acc;
    },
    {
      [eProductPackage.CAIXA]: 0,
      [eProductPackage.CAIXA_MADEIRA]: 0,
      [eProductPackage.CAIXA_PAPELAO]: 0,
      [eProductPackage.UNIDADE]: 0,
      [eProductPackage.BANDEIJA]: 0,
      [eProductPackage.SACO]: 0,
    } as Record<string, number>,
  );
}
