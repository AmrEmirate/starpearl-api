"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRepository = void 0;
const prisma_1 = require("../config/prisma");
const logger_1 = __importDefault(require("../utils/logger"));
const AppError_1 = __importDefault(require("../utils/AppError"));
class OrderRepository {
    async createOrderFromCart(input) {
        const { userId, cart, addressId, shippingCost, serviceFee, totalPrice, subtotal, logisticsOption, paymentMethod, } = input;
        try {
            const order = await prisma_1.prisma.$transaction(async (tx) => {
                logger_1.default.info(`Starting order transaction for user: ${userId}`);
                const productIds = cart.items.map((item) => item.productId);
                const productsInCart = await tx.product.findMany({
                    where: { id: { in: productIds } },
                    select: { id: true, stock: true, name: true },
                });
                const stockMap = new Map(productsInCart.map((p) => [p.id, p.stock]));
                const nameMap = new Map(productsInCart.map((p) => [p.id, p.name]));
                for (const item of cart.items) {
                    const availableStock = stockMap.get(item.productId);
                    if (availableStock === undefined || availableStock < item.quantity) {
                        throw new AppError_1.default(`Not enough stock for product: ${nameMap.get(item.productId)}. Available: ${availableStock || 0}`, 400);
                    }
                }
                const newOrder = await tx.order.create({
                    data: {
                        userId: userId,
                        shippingAddressId: addressId,
                        totalAmount: totalPrice,
                        subtotal: subtotal,
                        shippingFee: shippingCost,
                        serviceFee: serviceFee,
                        logisticsOption: logisticsOption,
                        paymentMethod: paymentMethod,
                        paymentStatus: "PENDING",
                        status: "PENDING_PAYMENT",
                    },
                });
                const orderItemsData = cart.items.map((item) => ({
                    orderId: newOrder.id,
                    productId: item.productId,
                    storeId: item.product.storeId,
                    quantity: item.quantity,
                    price: item.product.price,
                }));
                await tx.orderItem.createMany({
                    data: orderItemsData,
                });
                for (const item of cart.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: {
                                decrement: item.quantity,
                            },
                        },
                    });
                }
                await tx.cartItem.deleteMany({
                    where: { cartId: cart.id },
                });
                logger_1.default.info(`Transaction successful. Order created: ${newOrder.id}`);
                return newOrder;
            });
            return order;
        }
        catch (error) {
            if (error instanceof AppError_1.default) {
                throw error;
            }
            logger_1.default.error(`Order transaction failed for user: ${userId}`, error);
            throw new Error("Order creation failed due to an internal error");
        }
    }
    async findOrdersByUserId(userId) {
        return prisma_1.prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    async findOrdersByStoreId(storeId) {
        return prisma_1.prisma.order.findMany({
            where: {
                items: {
                    some: {
                        storeId: storeId,
                    },
                },
            },
            include: {
                items: {
                    where: {
                        storeId: storeId,
                    },
                    include: {
                        product: true,
                    },
                },
                shippingAddress: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    async updateOrderStatus(orderId, status, data) {
        try {
            return await prisma_1.prisma.order.update({
                where: { id: orderId },
                data: {
                    status: status,
                    ...data,
                },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                    user: {
                        select: { name: true, email: true },
                    },
                    shippingAddress: true,
                },
            });
        }
        catch (error) {
            logger_1.default.error(`Error updating order status: ${orderId}`, error);
            throw new Error("Database query failed");
        }
    }
}
exports.OrderRepository = OrderRepository;
