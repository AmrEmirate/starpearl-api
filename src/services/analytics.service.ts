import { prisma } from "../config/prisma";

export class AnalyticsService {
  async getStoreStats(storeId: string) {
    // 1. Total Revenue (Sum of totalAmount for COMPLETED orders)
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

    // Note: The above query sums the *entire* order amount even if it contains items from other stores.
    // For a multi-vendor system, we should sum the OrderItem.price * quantity for this store.
    // Let's refine this.

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

    // 2. Total Orders (Count of orders containing items from this store)
    const totalOrders = await prisma.order.count({
      where: {
        items: {
          some: {
            storeId: storeId,
          },
        },
      },
    });

    // 3. Total Products
    const totalProducts = await prisma.product.count({
      where: {
        storeId: storeId,
      },
    });

    // 4. Recent Orders
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
