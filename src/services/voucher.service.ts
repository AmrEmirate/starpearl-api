import { prisma } from "../config/prisma";
import { StoreVoucher } from "../generated/prisma";
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
    // Check if code already exists for this store (or globally if unique constraint is global)
    // Schema says code is unique globally or per store? Schema: code String @unique. So globally unique.
    const existing = await prisma.storeVoucher.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new AppError("Voucher code already exists", 400);
    }

    // Get store ID from user ID if needed, but here we assume storeId is passed correctly or derived
    // Actually, usually we pass userId and find store. Let's assume the controller passes the Store ID.

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
