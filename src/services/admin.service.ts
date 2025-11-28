import { prisma } from "../config/prisma";
import { StoreStatus, WithdrawalStatus } from "../generated/prisma";
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
}
