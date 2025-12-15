"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const prisma_1 = require("../config/prisma");
class AnalyticsService {
    async getStoreStats(storeId) {
        const revenueResult = await prisma_1.prisma.order.aggregate({
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
        const orderItems = await prisma_1.prisma.orderItem.findMany({
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
        const totalRevenue = orderItems.reduce((acc, item) => {
            return acc + Number(item.price) * item.quantity;
        }, 0);
        const totalOrders = await prisma_1.prisma.order.count({
            where: {
                items: {
                    some: {
                        storeId: storeId,
                    },
                },
            },
        });
        const totalProducts = await prisma_1.prisma.product.count({
            where: {
                storeId: storeId,
            },
        });
        const recentOrders = await prisma_1.prisma.order.findMany({
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
exports.AnalyticsService = AnalyticsService;
