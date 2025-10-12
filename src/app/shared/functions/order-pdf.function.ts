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
    body: [[`${order.agro_customers?.name || ''} - ${new Date(order.order_date).toLocaleDateString('pt-BR')}`]],
    headStyles: { fillColor: '#82c25e', fontStyle: 'bold', halign: 'left' },
    columnStyles: { 0: { fontStyle: 'bold', halign: 'left', fillColor: '#D9FFC2' } },
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
      `${quantity}${weight ? ` - ${weight}${product.way_counting == 'W' ? ' kg' : ' cx'}` : ''}`,
      product.package,
      product.name,
      `${price == 0 ? '' : `${price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}`,
      `${
        price == 0
          ? ''
          : `${(price * (product.way_counting === 'W' ? weight : quantity)).toLocaleString('pt-BR', {
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
      [eProductPackage.CAIXA_MADEIRA]: 0,
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

  doc.save(`Pedido:${order.agro_customers?.name || ''} - Data: ${new Date(order.order_date).toLocaleDateString('pt-BR')}.pdf`);
}

export function manyOrderPdf(orders: iOrder[]) {
  const doc = new jsPDF();
  const imageX = 14;
  const imageY = 5;
  const imageWidth = 20;
  const imageHeight = 20;

  doc.addImage('assets/images/logo-celinho.png', 'PNG', imageX, imageY, imageWidth, imageHeight);

  orders.forEach((order, index) => {
    autoTable(doc, {
      head: [[`Pedido #${order.id}`]],
      body: [[`${order.agro_customers?.name} - ${new Date(order.order_date).toLocaleDateString('pt-BR')}`]],
      headStyles: { fillColor: '#82c25e', fontStyle: 'bold', halign: 'left' },
      columnStyles: { 0: { fontStyle: 'bold', halign: 'left', fillColor: '#D9FFC2' } },
      startY: index === 0 && imageY,
      margin: index === 0 ? { left: imageX + imageWidth + 10 } : undefined, // empurra a tabela para a direita da imagem
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
        `${quantity}${weight ? ` - ${weight}${product.way_counting == 'W' ? ' kg' : ' cx'}` : ''}`,
        product.package,
        product.name,
        `${price == 0 ? '' : `${price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}`,
        `${
          price == 0
            ? ''
            : `${(price * (product.way_counting === 'W' ? weight : quantity)).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}`
        }`,
      ];
    });

    autoTable(doc, {
      head: [['Qtd.', 'Em.', 'Nome', 'Preço', 'SubTotal']],
      body: tableData,
      headStyles: { fillColor: '#d3d3d3', halign: 'left', cellWidth: 'wrap', textColor: '#333', fontStyle: 'bold', fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 18, fontSize: 8 },
        1: { cellWidth: 10, fontSize: 8 },
        2: { fontSize: 8 },
        3: { fontSize: 8 },
        4: { fontSize: 8 },
      } as {
        [key: string]: Partial<Styles>;
      },
      startY: index == 0 ? undefined : doc.lastAutoTable?.finalY || 0 + 1,
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
        [eProductPackage.CAIXA_MADEIRA]: 0,
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
      headStyles: { fillColor: '#d3d3d3', halign: 'right', fontStyle: 'bold', fontSize: 8, textColor: '#333' },
      columnStyles: {
        0: { halign: 'right', fontStyle: 'bold', fontSize: 8 },
        1: { halign: 'right', fontStyle: 'bold', fontSize: 8 },
        2: { halign: 'right', fontStyle: 'bold', fontSize: 8 },
      },
      startY: doc.lastAutoTable?.finalY || 0 + 1,
    });
  });

  doc.save(`Conjunto de PDFs - Data: ${new Date().toLocaleDateString('pt-BR')}.pdf`);
}

export function getTotalsByProductAndPackage(orders: iOrder[]) {
  const result: Record<
    string,
    {
      name: string;
      package: string;
      quantity: number;
      weight: number;
      subtotal: number;
    }
  > = {};

  orders.forEach((order) => {
    order.products_ordered.forEach((prod) => {
      // Para produtos "Melancia", concatena com o nome do cliente
      const productName = prod.name.includes('Melancia') ? `${prod.name} ${order.agro_customers?.name || ''}` : prod.name;

      const key = `${productName}|${prod.package}`;
      const quantity = prod.quantity && !isNaN(+prod.quantity) ? +prod.quantity : 0;
      const weight = prod.weight && !isNaN(+prod.weight) ? +prod.weight : 0;
      const price = prod.price && !isNaN(+prod.price) ? +prod.price : 0;
      const subtotal = prod.way_counting === 'W' ? price * weight : price * quantity;

      if (!result[key]) {
        result[key] = {
          name: productName,
          package: prod.package,
          quantity: 0,
          weight: 0,
          subtotal: 0,
        };
      }
      result[key].quantity += quantity;
      result[key].weight += weight;
      result[key].subtotal += subtotal;
    });
  });

  return Object.values(result);
}

function getTotalsByPackage(orders: iOrder[]) {
  return orders.reduce(
    (acc, order) => {
      order.products_ordered.forEach((prod) => {
        const pkg = prod.package;
        const quantity = prod.quantity && !isNaN(+prod.quantity) ? +prod.quantity : 0;
        if (pkg in acc) {
          acc[pkg] += quantity;
        }
      });
      return acc;
    },
    {
      [eProductPackage.CAIXA]: 0,
      [eProductPackage.CAIXA_PAPELAO]: 0,
      [eProductPackage.CAIXA_MADEIRA]: 0,
      [eProductPackage.UNIDADE]: 0,
      [eProductPackage.BANDEIJA]: 0,
      [eProductPackage.SACO]: 0,
    } as Record<string, number>,
  );
}

export function generatePDFByOrders(orders: iOrder[]): void {
  const doc = new jsPDF();
  const totalsByProduct = getTotalsByProductAndPackage(orders);

  //remover produtos com quantidade ou peso igual a zero
  const filteredTotalsByProduct = totalsByProduct.filter((prod) => prod.quantity > 0 || prod.weight > 0);

  // Monta tabela consolidada
  const tableData = filteredTotalsByProduct.map((prod) => [
    `${prod.quantity}${prod.weight ? ` - ${prod.weight}${prod.weight ? ' kg' : ' cx'}` : ''}`,
    prod.package,
    prod.name,
    `${prod.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
  ]);

  // ordena a tabela por nome do produto
  tableData.sort((a, b) => a[2].localeCompare(b[2]));
  // add order date in the head
  const orderDate = orders[0].order_date;
  const orderDateFormatted = new Date(orderDate).toLocaleDateString('pt-BR');

  autoTable(doc, {
    head: [['Qtd.', 'Em.', 'Nome', 'SubTotal', orderDateFormatted]],
    body: tableData,
    headStyles: { fillColor: '#82c25e', halign: 'left', cellWidth: 'wrap' },
    columnStyles: {
      0: { cellWidth: 18, fontSize: 8 },
      1: { cellWidth: 10, fontSize: 8 },
      2: { fontSize: 8 },
      3: { fontSize: 8 },
      4: { fontSize: 8 },
      5: { cellWidth: 3 },
    } as { [key: string]: Partial<Styles> },
    startY: 5,
  });

  const quantitiesByPackage = getTotalsByPackage(orders);
  const packages = Object.entries(quantitiesByPackage)
    .map(([key, value]) => (value > 0 ? `${value} ${key}` : null))
    .filter(Boolean);

  const totalAmount = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  autoTable(doc, {
    head: [['Volumes', 'Embalagens', 'Total']],
    body: [
      [
        `${packages.reduce((acc, item) => +acc + +(item?.split(' ')[0] ?? 0), 0)}`,
        packages.join(' | '),
        `${totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      ],
    ],
    headStyles: { fillColor: '#82c25e', halign: 'right', fontStyle: 'bold' },
    columnStyles: {
      0: { halign: 'right', fontStyle: 'bold' },
      1: { halign: 'right', fontStyle: 'bold' },
      2: { halign: 'right', fontStyle: 'bold' },
    },
  });

  doc.save(`Pedidos-Consolidados-${orderDateFormatted}.pdf`);
}
