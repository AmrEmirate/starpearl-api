import { prisma } from "../config/prisma";

export class AnalyticsService {
  async getStoreStats(storeId: string) {
    const revenueResult = await prisma.order.aggregate({
      where: {
        items: {
          some: {
            storeId: storeId,
          },
        },
        status: "DELIVERED", // Assuming DELIVERED means revenue is realized
      },
      _sum: {
        totalAmount: true,
      },
    });


    const orderItems = await prisma.orderItem.findMany({
      where: {
        storeId: storeId,
        order: {
          status: "DELIVERED",
        },
      },
      select: {
        price: true,
        quantity: true,
      },
    });

    const totalRevenue = orderItems.reduce(
      (acc: number, item: { price: any; quantity: number }) => {
        return acc + Number(item.price) * item.quantity;
      },
      0
    );

    const totalOrders = await prisma.order.count({
      where: {
        items: {
          some: {
            storeId: storeId,
          },
        },
      },
    });

    const totalProducts = await prisma.product.count({
      where: {
        storeId: storeId,
      },
    });

    const recentOrders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            storeId: storeId,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          where: {
            storeId: storeId,
          },
          include: {
            product: {
              select: {
                name: true,
                imageUrls: true,
              },
            },
          },
        },
      },
    });

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      recentOrders,
    };
  }
}
