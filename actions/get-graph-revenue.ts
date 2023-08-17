import prismadb from "@/lib/prismadb";

interface GraphData {
  name: string;
  total: number;
}

export const getGraphRevenue = async (storeId: string): Promise<GraphData[]> => {
  const paidOrders = await prismadb.order.findMany({
    where: {
      storeId,
      isPaid: true,
    },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });

  const monthlyRevenue: { [key: number]: number } = {};

  // Группировка заказов по месяцам и суммирование выручки
  for (const order of paidOrders) {
    const month = order.createdAt.getMonth(); // 0 for Jan, 1 for Feb, ...
    let revenueForOrder = 0;

    for (const item of order.orderItems) {
      revenueForOrder += item.product.price.toNumber();
    }

    // Добавление выручки по этому заказу к соответствующему месяцу
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + revenueForOrder;
  }

  // Преобразование сгруппированных данных в формат, ожидаемый графиком
  const graphData: GraphData[] = [
    { name: "Янв", total: 0 },
    { name: "Фев", total: 0 },
    { name: "Мар", total: 0 },
    { name: "Апр", total: 0 },
    { name: "Май", total: 0 },
    { name: "Июн", total: 0 },
    { name: "Июл", total: 0 },
    { name: "Авг", total: 0 },
    { name: "Сен", total: 0 },
    { name: "Окт", total: 0 },
    { name: "Ноя", total: 0 },
    { name: "Дек", total: 0 },
  ];

  // Заполнение данных о доходах
  for (const month in monthlyRevenue) {
    graphData[parseInt(month)].total = monthlyRevenue[parseInt(month)];
  }

  return graphData;
};
