"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoucherService = void 0;
const prisma_1 = require("../config/prisma");
const AppError_1 = __importDefault(require("../utils/AppError"));
class VoucherService {
    async createVoucher(storeId, data) {
        const existing = await prisma_1.prisma.storeVoucher.findUnique({
            where: { code: data.code },
        });
        if (existing) {
            throw new AppError_1.default("Voucher code already exists", 400);
        }
        return prisma_1.prisma.storeVoucher.create({
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
    async getStoreVouchers(userId) {
        const store = await prisma_1.prisma.store.findUnique({
            where: { userId },
        });
        if (!store) {
            throw new AppError_1.default("Store not found", 404);
        }
        return prisma_1.prisma.storeVoucher.findMany({
            where: { storeId: store.id },
            orderBy: { createdAt: "desc" },
        });
    }
    async deleteVoucher(userId, voucherId) {
        const store = await prisma_1.prisma.store.findUnique({
            where: { userId },
        });
        if (!store) {
            throw new AppError_1.default("Store not found", 404);
        }
        const voucher = await prisma_1.prisma.storeVoucher.findUnique({
            where: { id: voucherId },
        });
        if (!voucher || voucher.storeId !== store.id) {
            throw new AppError_1.default("Voucher not found or unauthorized", 404);
        }
        return prisma_1.prisma.storeVoucher.delete({
            where: { id: voucherId },
        });
    }
}
exports.VoucherService = VoucherService;
