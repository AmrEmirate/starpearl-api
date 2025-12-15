"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const order_repository_1 = require("../repositories/order.repository");
const cart_repository_1 = require("../repositories/cart.repository"); // Kita perlu ini
const prisma_1 = require("../config/prisma"); // Kita perlu ini untuk cek alamat
const AppError_1 = __importDefault(require("../utils/AppError"));
const logger_1 = __importDefault(require("../utils/logger"));
const payment_service_1 = require("./payment.service");
class OrderService {
    orderRepository;
    cartRepository;
    constructor() {
        this.orderRepository = new order_repository_1.OrderRepository();
        this.cartRepository = new cart_repository_1.CartRepository(); // Inisialisasi repo keranjang
    }
    async createOrder(userId, data) {
        logger_1.default.info(`Processing createOrder for user: ${userId}`);
        const userCart = await this.cartRepository.findCartByUserId(userId);
        if (!userCart) {
            throw new AppError_1.default("User cart not found", 404);
        }
        const fullCart = (await this.cartRepository.getFullCart(userCart.id));
        if (!fullCart || fullCart.items.length === 0) {
            throw new AppError_1.default("Cannot create order from an empty cart", 400);
        }
        const address = await prisma_1.prisma.address.findFirst({
            where: { id: data.addressId, userId: userId },
        });
        if (!address) {
            throw new AppError_1.default("Address not found or does not belong to user", 404);
        }
        const calculatedSubtotal = fullCart.items.reduce((sum, item) => {
            return sum + Number(item.product.price) * item.quantity;
        }, 0);
        const calculatedServiceFee = calculatedSubtotal < 50000
            ? 0
            : Math.ceil(calculatedSubtotal / 100000) * 1000;
        const calculatedShippingCost = data.shippingCost;
        const calculatedTotalPrice = calculatedSubtotal + calculatedServiceFee + calculatedShippingCost;
        if (Math.abs(calculatedTotalPrice - data.totalPrice) > 1) {
            logger_1.default.warn(`Price mismatch for user ${userId}. FE: ${data.totalPrice}, BE: ${calculatedTotalPrice}`);
            throw new AppError_1.default("Total price mismatch. Please try again.", 400);
        }
        const orderInput = {
            userId,
            cart: fullCart,
            addressId: data.addressId,
            shippingCost: calculatedShippingCost,
            serviceFee: calculatedServiceFee,
            totalPrice: calculatedTotalPrice,
            subtotal: calculatedSubtotal, // Kirim subtotal hasil hitungan
            logisticsOption: data.logisticsOption,
            paymentMethod: data.paymentMethod,
        };
        const order = await this.orderRepository.createOrderFromCart(orderInput);
        const paymentService = new payment_service_1.PaymentService();
        const snapToken = await paymentService.generateSnapToken(order);
        return { ...order, snapToken };
    }
    async getMyOrders(userId) {
        return this.orderRepository.findOrdersByUserId(userId);
    }
    async getStoreOrders(userId) {
        logger_1.default.info(`Fetching store orders for user: ${userId}`);
        const store = await prisma_1.prisma.store.findUnique({
            where: { userId: userId },
            select: { id: true },
        });
        if (!store) {
            throw new AppError_1.default("Store not found for this user", 404);
        }
        return this.orderRepository.findOrdersByStoreId(store.id);
    }
    async updateOrderStatus(userId, orderId, status, shippingResi) {
        logger_1.default.info(`Updating order status ${orderId} to ${status} by user ${userId}`);
        const store = await prisma_1.prisma.store.findUnique({
            where: { userId: userId },
            select: { id: true },
        });
        if (!store) {
            throw new AppError_1.default("Store not found for this user", 404);
        }
        const orderItem = await prisma_1.prisma.orderItem.findFirst({
            where: {
                orderId: orderId,
                storeId: store.id,
            },
        });
        if (!orderItem) {
            throw new AppError_1.default("Order not found or does not belong to your store", 404);
        }
        const validStatuses = [
            "PENDING",
            "PROCESSED",
            "SHIPPED",
            "DELIVERED",
            "CANCELLED",
        ];
        if (!validStatuses.includes(status)) {
            throw new AppError_1.default("Invalid order status", 400);
        }
        const updateData = { status };
        if (status === "SHIPPED" && shippingResi) {
            updateData.shippingResi = shippingResi;
        }
        return this.orderRepository.updateOrderStatus(orderId, status, updateData);
    }
    async updateOrderStatusSystem(orderId, status) {
        logger_1.default.info(`System updating order status ${orderId} to ${status}`);
        return this.orderRepository.updateOrderStatus(orderId, status);
    }
    async confirmOrderReceived(userId, orderId) {
        logger_1.default.info(`Buyer ${userId} confirming order ${orderId} as received`);
        // Verify the order belongs to this buyer
        const order = await prisma_1.prisma.order.findFirst({
            where: { id: orderId, userId: userId },
            include: {
                items: {
                    include: {
                        product: {
                            select: { storeId: true },
                        },
                    },
                },
            },
        });
        if (!order) {
            throw new AppError_1.default("Order not found or does not belong to you", 404);
        }
        // Check if order is in SHIPPED status
        if (order.status !== "SHIPPED") {
            throw new AppError_1.default("Order can only be confirmed when status is SHIPPED", 400);
        }
        // Get unique store IDs from order items
        const storeIds = [...new Set(order.items.map((item) => item.storeId))];
        // Calculate amount per store (subtotal only, excluding fees)
        const storeAmounts = new Map();
        for (const item of order.items) {
            const current = storeAmounts.get(item.storeId) || 0;
            storeAmounts.set(item.storeId, current + Number(item.price) * item.quantity);
        }
        // Update order status and transfer funds to sellers in transaction
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            // Update order status to DELIVERED
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: { status: "DELIVERED" },
            });
            // Transfer funds to each store's balance
            for (const [storeId, amount] of storeAmounts) {
                await tx.store.update({
                    where: { id: storeId },
                    data: {
                        balance: {
                            increment: amount,
                        },
                    },
                });
                logger_1.default.info(`Transferred ${amount} to store ${storeId}`);
            }
            return updatedOrder;
        });
        logger_1.default.info(`Order ${orderId} confirmed as received, funds transferred`);
        return result;
    }
}
exports.OrderService = OrderService;
