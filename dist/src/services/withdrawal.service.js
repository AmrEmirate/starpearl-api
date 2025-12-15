"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawalService = void 0;
const prisma_1 = require("../config/prisma");
const AppError_1 = __importDefault(require("../utils/AppError"));
const logger_1 = __importDefault(require("../utils/logger"));
class WithdrawalService {
    async requestWithdrawal(userId, amount, bankName, bankAccount, bankUser) {
        const store = await prisma_1.prisma.store.findUnique({
            where: { userId },
        });
        if (!store) {
            throw new AppError_1.default("Store not found", 404);
        }
        if (store.balance.toNumber() < amount) {
            throw new AppError_1.default("Insufficient balance", 400);
        }
        if (amount < 10000) {
            throw new AppError_1.default("Minimum withdrawal amount is 10,000", 400);
        }
        try {
            const result = await prisma_1.prisma.$transaction(async (tx) => {
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
            logger_1.default.info(`Withdrawal requested by store ${store.id} for amount ${amount}`);
            return result;
        }
        catch (error) {
            logger_1.default.error("Error processing withdrawal request", error);
            throw new AppError_1.default("Failed to process withdrawal request", 500);
        }
    }
    async getStoreWithdrawals(userId) {
        const store = await prisma_1.prisma.store.findUnique({
            where: { userId },
        });
        if (!store) {
            throw new AppError_1.default("Store not found", 404);
        }
        return prisma_1.prisma.withdrawal.findMany({
            where: { storeId: store.id },
            orderBy: { createdAt: "desc" },
        });
    }
    async getStoreBalance(userId) {
        const store = await prisma_1.prisma.store.findUnique({
            where: { userId },
            select: { balance: true },
        });
        if (!store) {
            throw new AppError_1.default("Store not found", 404);
        }
        return store.balance.toNumber();
    }
}
exports.WithdrawalService = WithdrawalService;
