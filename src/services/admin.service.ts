import { prisma } from "../config/prisma";
import { StoreStatus, WithdrawalStatus } from "@prisma/client";
import AppError from "../utils/AppError";

export class AdminService {
  public async getDashboardStats() {
    const [totalUsers, totalStores, totalOrders, totalRevenue] =
      await Promise.all([
        prisma.user.count(),
        prisma.store.count(),
        prisma.order.count(),
        prisma.order.aggregate({
          _sum: {
            totalAmount: true,
          },
          where: {
            status: "DELIVERED",
          },
        }),
      ]);

    return {
      totalUsers,
      totalStores,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
    };
  }

  public async getPendingStores() {
    return prisma.store.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }

  public async verifyStore(storeId: string, status: StoreStatus) {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw new AppError("Store not found", 404);
    }

    return prisma.store.update({
      where: { id: storeId },
      data: { status },
    });
  }

  public async getPendingWithdrawals() {
    return prisma.withdrawal.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        store: {
          select: {
            name: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  public async processWithdrawal(
    withdrawalId: string,
    status: WithdrawalStatus
  ) {
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      throw new AppError("Withdrawal request not found", 404);
    }

    if (withdrawal.status !== "PENDING") {
      throw new AppError("Withdrawal request already processed", 400);
    }

    return prisma.$transaction(async (tx) => {
      const updatedWithdrawal = await tx.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status,
          processedAt: new Date(),
        },
      });

      if (status === "REJECTED") {
        await tx.store.update({
          where: { id: withdrawal.storeId },
          data: {
            balance: {
              increment: withdrawal.amount,
            },
          },
        });
      }

      return updatedWithdrawal;
    });
  }
  // Platform Settings
  public async getSettings() {
    let settings = await prisma.platformSettings.findUnique({
      where: { id: "singleton" },
    });

    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: {
          id: "singleton",
          serviceFeeMin: 50000,
          serviceFeeRate: 1000,
          serviceFeeInterval: 100000,
        },
      });
    }

    return settings;
  }

  public async updateSettings(data: {
    serviceFeeMin?: number;
    serviceFeeRate?: number;
    serviceFeeInterval?: number;
  }) {
    return prisma.platformSettings.upsert({
      where: { id: "singleton" },
      update: data,
      create: {
        id: "singleton",
        serviceFeeMin: data.serviceFeeMin || 50000,
        serviceFeeRate: data.serviceFeeRate || 1000,
        serviceFeeInterval: data.serviceFeeInterval || 100000,
      },
    });
  }

  // Homepage Content (Banners)
  public async getBanners() {
    return prisma.homepageContent.findMany({
      orderBy: { order: "asc" },
    });
  }

  public async createBanner(data: any) {
    return prisma.homepageContent.create({
      data: {
        ...data,
        type: "BANNER",
      },
    });
  }

  public async updateBanner(id: string, data: any) {
    return prisma.homepageContent.update({
      where: { id },
      data,
    });
  }

  public async deleteBanner(id: string) {
    return prisma.homepageContent.delete({
      where: { id },
    });
  }

  // Platform Promotions
  public async getPromotions() {
    return prisma.platformPromotion.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  public async createPromotion(data: any) {
    return prisma.platformPromotion.create({
      data,
    });
  }

  public async updatePromotion(id: string, data: any) {
    return prisma.platformPromotion.update({
      where: { id },
      data,
    });
  }

  public async deletePromotion(id: string) {
    return prisma.platformPromotion.delete({
      where: { id },
    });
  }

  // Community Moderation
  public async getPendingPosts() {
    return prisma.communityPost.findMany({
      where: { status: "PENDING" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  public async moderatePost(postId: string, status: "APPROVED" | "REJECTED") {
    return prisma.communityPost.update({
      where: { id: postId },
      data: { status },
    });
  }

  // Dispute Management
  public async getDisputes() {
    return prisma.dispute.findMany({
      include: {
        order: true,
        buyer: true,
        store: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  public async resolveDispute(
    id: string,
    resolution: { status: "RESOLVED_REFUND" | "RESOLVED_RELEASE" }
  ) {
    const dispute = await prisma.dispute.findUnique({ where: { id } });
    if (!dispute) throw new AppError("Dispute not found", 404);

    // Update dispute status
    const updatedDispute = await prisma.dispute.update({
      where: { id },
      data: { status: resolution.status },
    });

    // Handle logic based on resolution (e.g., refunding money or releasing to seller)
    // For now, we just update the status as the payment integration is simulated/sandbox.

    return updatedDispute;
  }

  // User Management
  public async getAllUsers(filters?: {
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters?.role) {
      where.role = filters.role;
    }
    if (filters?.search) {
      where.OR = [
        { email: { contains: filters.search, mode: "insensitive" } },
        { name: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
          sellerProfile: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async suspendUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);

    // If user is a seller, suspend their store too
    if (user.role === "SELLER") {
      await prisma.store.updateMany({
        where: { userId },
        data: { status: "SUSPENDED" },
      });
    }

    // In a real system, you might have a 'suspended' field on User
    // For now, we'll just mark seller stores as suspended
    return { message: "User suspended successfully" };
  }

  public async deleteUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);

    // Cascade delete is handled by Prisma schema
    await prisma.user.delete({ where: { id: userId } });

    return { message: "User deleted successfully" };
  }

  public async resetUserPassword(userId: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);

    const bcrypt = require("bcrypt");
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: "Password reset successfully" };
  }

  // Enhanced Reporting
  public async getSalesReport(filters?: {
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = {
      status: "DELIVERED",
    };

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    const [orders, totalRevenue, serviceFeeRevenue] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.aggregate({
        where,
        _sum: {
          totalAmount: true,
          subtotal: true,
        },
      }),
      prisma.order.aggregate({
        where,
        _sum: {
          serviceFee: true,
        },
      }),
    ]);

    // Get top selling products
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: where,
      },
      _sum: {
        quantity: true,
      },
      _count: {
        productId: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 10,
    });

    const productDetails = await prisma.product.findMany({
      where: {
        id: {
          in: topProducts.map((p) => p.productId),
        },
      },
      select: {
        id: true,
        name: true,
        imageUrls: true,
        price: true,
      },
    });

    const topProductsWithDetails = topProducts.map((item) => ({
      ...item,
      product: productDetails.find((p) => p.id === item.productId),
    }));

    return {
      period: {
        startDate: filters?.startDate,
        endDate: filters?.endDate,
      },
      summary: {
        totalOrders: orders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        subtotalRevenue: totalRevenue._sum.subtotal || 0,
        serviceFeeRevenue: serviceFeeRevenue._sum.serviceFee || 0,
      },
      topProducts: topProductsWithDetails,
    };
  }

  public async getServiceFeeReport(filters?: {
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = {
      status: "DELIVERED",
    };

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    const serviceFeeData = await prisma.order.aggregate({
      where,
      _sum: {
        serviceFee: true,
      },
      _avg: {
        serviceFee: true,
      },
      _count: {
        id: true,
      },
    });

    // Group by date for chart data
    const dailyServiceFees = await prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as date,
        SUM("serviceFee") as total_fee,
        COUNT(*) as order_count
      FROM "Order"
      WHERE "status" = 'DELIVERED'
        ${
          filters?.startDate
            ? prisma.$queryRaw`AND "createdAt" >= ${new Date(
                filters.startDate
              )}::timestamp`
            : prisma.$queryRaw``
        }
        ${
          filters?.endDate
            ? prisma.$queryRaw`AND "createdAt" <= ${new Date(
                filters.endDate
              )}::timestamp`
            : prisma.$queryRaw``
        }
      GROUP BY DATE("createdAt")
      ORDER BY DATE("createdAt") DESC
      LIMIT 30
    `;

    return {
      period: {
        startDate: filters?.startDate,
        endDate: filters?.endDate,
      },
      summary: {
        totalServiceFee: serviceFeeData._sum.serviceFee || 0,
        averageServiceFee: serviceFeeData._avg.serviceFee || 0,
        totalOrders: serviceFeeData._count.id,
      },
      dailyBreakdown: dailyServiceFees,
    };
  }

  public async getTrafficReport() {
    const [totalUsers, newUsersThisMonth, totalStores, newStoresThisMonth] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
        prisma.store.count(),
        prisma.store.count({
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
      ]);

    // User registration trend (last 12 months)
    const userTrend = await prisma.$queryRaw`
      SELECT 
        TO_CHAR("createdAt", 'YYYY-MM') as month,
        COUNT(*) as count
      FROM "User"
      WHERE "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
      ORDER BY month DESC
    `;

    return {
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
      },
      stores: {
        total: totalStores,
        newThisMonth: newStoresThisMonth,
      },
      userRegistrationTrend: userTrend,
    };
  }
}
