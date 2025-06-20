import { Pipe, PipeTransform } from '@angular/core';
import { eProductPackage } from 'src/app/domain/products/enums/products.enums';
import { iProductOrder } from 'src/app/domain/purchase-orders/interfaces/purchase-orders.interface';

@Pipe({
  name: 'countPackages',
  standalone: true,
})
export class CountPackagesPipe implements PipeTransform {
  transform(packages: iProductOrder[]): string {
    const quantitiesByPackage = packages.reduce(
      (acc: Record<string, number>, product: any) => {
        const pkg = product.package;
        const quantity = typeof +product.quantity === 'number' ? +product.quantity : 0;

        if (pkg in acc) {
          acc[pkg] += quantity;
        }

        return acc;
      },
      {
        [eProductPackage.CAIXA]: 0,
        [eProductPackage.CAIXA_MADEIRA]: 0,
        [eProductPackage.CAIXA_PAPELAO]: 0,
        [eProductPackage.UNIDADE]: 0,
        [eProductPackage.BANDEIJA]: 0,
        [eProductPackage.SACO]: 0,
      },
    );

    return `${quantitiesByPackage[eProductPackage.CAIXA]} ${eProductPackage.CAIXA} - ${
      quantitiesByPackage[eProductPackage.CAIXA_PAPELAO]
    } ${eProductPackage.CAIXA_PAPELAO} - ${quantitiesByPackage[eProductPackage.CAIXA_MADEIRA]} ${
      eProductPackage.CAIXA_MADEIRA
    } - ${quantitiesByPackage[eProductPackage.UNIDADE]} ${eProductPackage.UNIDADE} - ${
      quantitiesByPackage[eProductPackage.BANDEIJA]
    } ${eProductPackage.BANDEIJA} - ${quantitiesByPackage[eProductPackage.SACO]} ${eProductPackage.SACO}`;
  }
}
