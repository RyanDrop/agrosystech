import jsPDF from 'jspdf';
import autoTable, { Styles } from 'jspdf-autotable';
import { eProductPackage } from 'src/app/domain/products/enums/products.enums';
import { iOrder } from 'src/app/domain/purchase-orders/interfaces/purchase-orders.interface';

export function generatePDF(order: iOrder): void {
  const doc = new jsPDF();

  const imageX = 14;
  const imageY = 5;
  const imageWidth = 20;
  const imageHeight = 20;

  doc.addImage('assets/images/logo-celinho.png', 'PNG', imageX, imageY, imageWidth, imageHeight);

  autoTable(doc, {
    head: [[`Pedido #${order.id}`]],
    body: [[`${order.agro_customers?.name} - ${new Date(order.order_date).toLocaleDateString('pt-BR')}`]],
    headStyles: { fillColor: '#82c25e', fontStyle: 'bold', halign: 'left' },
    columnStyles: { 0: { fontStyle: 'bold', halign: 'left' } },
    startY: imageY,
    margin: { left: imageX + imageWidth + 10 }, // empurra a tabela para a direita da imagem
  });

  const filterQuantityOrWeightEqualEmptyOrZero = order.products_ordered.filter((product) => {
    const hasQuantity = product.quantity && typeof +product.quantity === 'number' && product.quantity > 0;
    const hasWeight = product.weight && typeof +product.weight === 'number' && product.weight > 0;
    return hasQuantity || hasWeight;
  });

  const tableData = filterQuantityOrWeightEqualEmptyOrZero.map((product) => {
    const price = product.price && typeof +product.price === 'number' ? +product.price : 0;
    const quantity = product.quantity && typeof +product.quantity === 'number' ? +product.quantity : 0;
    const weight = product.weight && typeof +product.weight === 'number' ? +product.weight : 0;
    return [
      `${quantity}${weight ? ` - ${weight}kg` : ''}`,
      product.package,
      product.name,
      `${price == 0 ? '' : `${price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}`,
      `${
        price == 0
          ? ''
          : `${(price * (product.way_counting === 'Q' ? quantity : weight)).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}`
      }`,
    ];
  });

  autoTable(doc, {
    head: [['Qtd.', 'Em.', 'Nome', 'Preço', 'SubTotal']],
    body: tableData,
    headStyles: { fillColor: '#82c25e', halign: 'left', cellWidth: 'wrap' },
    columnStyles: {
      0: { cellWidth: 18, fontSize: 8 },
      1: { cellWidth: 10, fontSize: 8 },
      2: { fontSize: 8 },
      3: { fontSize: 8 },
      4: { fontSize: 8 },
    } as {
      [key: string]: Partial<Styles>;
    },
  });

  const quantitiesByPackage = order.products_ordered.reduce(
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
      [eProductPackage.CAIXA_PAPELAO]: 0,
      [eProductPackage.UNIDADE]: 0,
      [eProductPackage.BANDEIJA]: 0,
      [eProductPackage.SACO]: 0,
    },
  );

  const packages = Object.entries(quantitiesByPackage)
    .map(([key, value]) => {
      return value > 0 ? `${value} ${key}` : null;
    })
    .filter(Boolean);

  autoTable(doc, {
    head: [['Volumes', 'Embalagens', 'Total']],
    body: [
      [
        `${packages.reduce((acc, item) => +acc + +(item?.split(' ')[0] ?? 0), 0)}`,
        packages.join(' | '),
        `${order.total_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      ],
    ],
    headStyles: { fillColor: '#82c25e', halign: 'right', fontStyle: 'bold' },
    columnStyles: {
      0: { halign: 'right', fontStyle: 'bold' },
      1: { halign: 'right', fontStyle: 'bold' },
      2: { halign: 'right', fontStyle: 'bold' },
    },
  });

  doc.save(`Pedido:${order.agro_customers?.name} - Data: ${new Date(order.order_date).toLocaleDateString('pt-BR')}.pdf`);
}
