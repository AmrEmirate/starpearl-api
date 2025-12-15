import { prisma } from "../config/prisma";
import { StoreVoucher } from "@prisma/client";
import AppError from "../utils/AppError";

export class VoucherService {
  public async createVoucher(
    storeId: string,
    data: {
      code: string;
      description?: string;
      discountType: "FIXED" | "PERCENT";
      discountValue: number;
      minPurchase: number;
      maxUses?: number;
      expiresAt?: Date;
    }
  ): Promise<StoreVoucher> {
    const existing = await prisma.storeVoucher.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new AppError("Voucher code already exists", 400);
    }

    return prisma.storeVoucher.create({
      data: {
        storeId,
        code: data.code,
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minPurchase: data.minPurchase,
        maxUses: data.maxUses,
        expiresAt: data.expiresAt,
      },
    });
  }

  public async getStoreVouchers(userId: string): Promise<StoreVoucher[]> {
    const store = await prisma.store.findUnique({
      where: { userId },
    });

    if (!store) {
      throw new AppError("Store not found", 404);
    }

    return prisma.storeVoucher.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: "desc" },
    });
  }

  public async deleteVoucher(userId: string, voucherId: string) {
    const store = await prisma.store.findUnique({
      where: { userId },
    });

    if (!store) {
      throw new AppError("Store not found", 404);
    }

    const voucher = await prisma.storeVoucher.findUnique({
      where: { id: voucherId },
    });

    if (!voucher || voucher.storeId !== store.id) {
      throw new AppError("Voucher not found or unauthorized", 404);
    }

    return prisma.storeVoucher.delete({
      where: { id: voucherId },
    });
  }
}
