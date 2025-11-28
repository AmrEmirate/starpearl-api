import { prisma } from "../config/prisma";
import { Withdrawal } from "../generated/prisma";
import AppError from "../utils/AppError";
import logger from "../utils/logger";

export class WithdrawalService {
  public async requestWithdrawal(
    userId: string,
    amount: number,
    bankName: string,
    bankAccount: string,
    bankUser: string
  ): Promise<Withdrawal> {
    const store = await prisma.store.findUnique({
      where: { userId },
    });

    if (!store) {
      throw new AppError("Store not found", 404);
    }

    if (store.balance.toNumber() < amount) {
      throw new AppError("Insufficient balance", 400);
    }

    if (amount < 10000) {
      throw new AppError("Minimum withdrawal amount is 10,000", 400);
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        await tx.store.update({
          where: { id: store.id },
          data: {
            balance: {
              decrement: amount,
            },
          },
        });

        const withdrawal = await tx.withdrawal.create({
          data: {
            storeId: store.id,
            amount,
            bankName,
            bankAccount,
            bankUser,
            status: "PENDING",
          },
        });

        return withdrawal;
      });

      logger.info(
        `Withdrawal requested by store ${store.id} for amount ${amount}`
      );
      return result;
    } catch (error) {
      logger.error("Error processing withdrawal request", error);
      throw new AppError("Failed to process withdrawal request", 500);
    }
  }

  public async getStoreWithdrawals(userId: string): Promise<Withdrawal[]> {
    const store = await prisma.store.findUnique({
      where: { userId },
    });

    if (!store) {
      throw new AppError("Store not found", 404);
    }

    return prisma.withdrawal.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: "desc" },
    });
  }

  public async getStoreBalance(userId: string): Promise<number> {
    const store = await prisma.store.findUnique({
      where: { userId },
      select: { balance: true },
    });

    if (!store) {
      throw new AppError("Store not found", 404);
    }

    return store.balance.toNumber();
  }
}
