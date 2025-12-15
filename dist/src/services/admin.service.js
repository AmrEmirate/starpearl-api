"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const prisma_1 = require("../config/prisma");
const AppError_1 = __importDefault(require("../utils/AppError"));
class AdminService {
    async getDashboardStats() {
        const [totalUsers, totalStores, totalOrders, totalRevenue] = await Promise.all([
            prisma_1.prisma.user.count(),
            prisma_1.prisma.store.count(),
            prisma_1.prisma.order.count(),
            prisma_1.prisma.order.aggregate({
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
    async getPendingStores() {
        return prisma_1.prisma.store.findMany({
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
    async verifyStore(storeId, status) {
        const store = await prisma_1.prisma.store.findUnique({
            where: { id: storeId },
        });
        if (!store) {
            throw new AppError_1.default("Store not found", 404);
        }
        return prisma_1.prisma.store.update({
            where: { id: storeId },
            data: { status },
        });
    }
    async getPendingWithdrawals() {
        return prisma_1.prisma.withdrawal.findMany({
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
    async processWithdrawal(withdrawalId, status) {
        const withdrawal = await prisma_1.prisma.withdrawal.findUnique({
            where: { id: withdrawalId },
        });
        if (!withdrawal) {
            throw new AppError_1.default("Withdrawal request not found", 404);
        }
        if (withdrawal.status !== "PENDING") {
            throw new AppError_1.default("Withdrawal request already processed", 400);
        }
        return prisma_1.prisma.$transaction(async (tx) => {
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
    async getSettings() {
        let settings = await prisma_1.prisma.platformSettings.findUnique({
            where: { id: "singleton" },
        });
        if (!settings) {
            settings = await prisma_1.prisma.platformSettings.create({
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
    async updateSettings(data) {
        return prisma_1.prisma.platformSettings.upsert({
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
    async getBanners() {
        return prisma_1.prisma.homepageContent.findMany({
            orderBy: { order: "asc" },
        });
    }
    async createBanner(data) {
        return prisma_1.prisma.homepageContent.create({
            data: {
                ...data,
                type: "BANNER",
            },
        });
    }
    async updateBanner(id, data) {
        return prisma_1.prisma.homepageContent.update({
            where: { id },
            data,
        });
    }
    async deleteBanner(id) {
        return prisma_1.prisma.homepageContent.delete({
            where: { id },
        });
    }
    // Platform Promotions
    async getPromotions() {
        return prisma_1.prisma.platformPromotion.findMany({
            orderBy: { createdAt: "desc" },
        });
    }
    async createPromotion(data) {
        return prisma_1.prisma.platformPromotion.create({
            data,
        });
    }
    async updatePromotion(id, data) {
        return prisma_1.prisma.platformPromotion.update({
            where: { id },
            data,
        });
    }
    async deletePromotion(id) {
        return prisma_1.prisma.platformPromotion.delete({
            where: { id },
        });
    }
    // Community Moderation
    async getPendingPosts() {
        return prisma_1.prisma.communityPost.findMany({
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
    async moderatePost(postId, status) {
        return prisma_1.prisma.communityPost.update({
            where: { id: postId },
            data: { status },
        });
    }
    // Dispute Management
    async getDisputes() {
        return prisma_1.prisma.dispute.findMany({
            include: {
                order: true,
                buyer: true,
                store: true,
            },
            orderBy: { createdAt: "desc" },
        });
    }
    async resolveDispute(id, resolution) {
        const dispute = await prisma_1.prisma.dispute.findUnique({ where: { id } });
        if (!dispute)
            throw new AppError_1.default("Dispute not found", 404);
        // Update dispute status
        const updatedDispute = await prisma_1.prisma.dispute.update({
            where: { id },
            data: { status: resolution.status },
        });
        // Handle logic based on resolution (e.g., refunding money or releasing to seller)
        // For now, we just update the status as the payment integration is simulated/sandbox.
        return updatedDispute;
    }
    // User Management
    async getAllUsers(filters) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;
        const where = {};
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
            prisma_1.prisma.user.findMany({
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
            prisma_1.prisma.user.count({ where }),
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
    async suspendUser(userId) {
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new AppError_1.default("User not found", 404);
        // If user is a seller, suspend their store too
        if (user.role === "SELLER") {
            await prisma_1.prisma.store.updateMany({
                where: { userId },
                data: { status: "SUSPENDED" },
            });
        }
        // In a real system, you might have a 'suspended' field on User
        // For now, we'll just mark seller stores as suspended
        return { message: "User suspended successfully" };
    }
    async deleteUser(userId) {
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new AppError_1.default("User not found", 404);
        // Cascade delete is handled by Prisma schema
        await prisma_1.prisma.user.delete({ where: { id: userId } });
        return { message: "User deleted successfully" };
    }
    async resetUserPassword(userId, newPassword) {
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new AppError_1.default("User not found", 404);
        const bcrypt = require("bcrypt");
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });
        return { message: "Password reset successfully" };
    }
    // Enhanced Reporting
    async getSalesReport(filters) {
        const where = {
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
            prisma_1.prisma.order.count({ where }),
            prisma_1.prisma.order.aggregate({
                where,
                _sum: {
                    totalAmount: true,
                    subtotal: true,
                },
            }),
            prisma_1.prisma.order.aggregate({
                where,
                _sum: {
                    serviceFee: true,
                },
            }),
        ]);
        // Get top selling products
        const topProducts = await prisma_1.prisma.orderItem.groupBy({
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
        const productDetails = await prisma_1.prisma.product.findMany({
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
    async getServiceFeeReport(filters) {
        const where = {
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
        const serviceFeeData = await prisma_1.prisma.order.aggregate({
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
        const dailyServiceFees = await prisma_1.prisma.$queryRaw `
      SELECT 
        DATE("createdAt") as date,
        SUM("serviceFee") as total_fee,
        COUNT(*) as order_count
      FROM "Order"
      WHERE "status" = 'DELIVERED'
        ${filters?.startDate
            ? prisma_1.prisma.$queryRaw `AND "createdAt" >= ${new Date(filters.startDate)}::timestamp`
            : prisma_1.prisma.$queryRaw ``}
        ${filters?.endDate
            ? prisma_1.prisma.$queryRaw `AND "createdAt" <= ${new Date(filters.endDate)}::timestamp`
            : prisma_1.prisma.$queryRaw ``}
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
    async getTrafficReport() {
        const [totalUsers, newUsersThisMonth, totalStores, newStoresThisMonth] = await Promise.all([
            prisma_1.prisma.user.count(),
            prisma_1.prisma.user.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    },
                },
            }),
            prisma_1.prisma.store.count(),
            prisma_1.prisma.store.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    },
                },
            }),
        ]);
        // User registration trend (last 12 months)
        const userTrend = await prisma_1.prisma.$queryRaw `
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
exports.AdminService = AdminService;
