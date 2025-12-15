"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckoutService = void 0;
const prisma_1 = require("../config/prisma");
const cart_repository_1 = require("../repositories/cart.repository");
const order_repository_1 = require("../repositories/order.repository");
const AppError_1 = __importDefault(require("../utils/AppError"));
const logger_1 = __importDefault(require("../utils/logger"));
const client_1 = require("@prisma/client");
class CheckoutService {
    cartRepository;
    orderRepository;
    constructor() {
        this.cartRepository = new cart_repository_1.CartRepository();
        this.orderRepository = new order_repository_1.OrderRepository();
    }
    async processCheckout(userId, addressId) {
        logger_1.default.info(`Processing checkout for user: ${userId} with address: ${addressId}`);
        const address = await prisma_1.prisma.address.findUnique({
            where: { id: addressId, userId },
        });
        if (!address) {
            throw new AppError_1.default("Address not found or does not belong to user", 404);
        }
        const cart = await this.cartRepository.findCartByUserId(userId);
        if (!cart) {
            throw new AppError_1.default("Cart not found", 404);
        }
        const fullCart = await this.cartRepository.getFullCart(cart.id);
        if (!fullCart || fullCart.items.length === 0) {
            throw new AppError_1.default("Cart is empty", 400);
        }
        let totalAmount = 0;
        const orderItemsData = [];
        for (const item of fullCart.items) {
            if (item.product.stock < item.quantity) {
                throw new AppError_1.default(`Not enough stock for product: ${item.product.name}`, 400);
            }
            const itemTotal = Number(item.product.price) * item.quantity;
            totalAmount += itemTotal;
            orderItemsData.push({
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.price,
                storeId: item.product.storeId,
            });
        }
        const serviceFee = totalAmount < 50000 ? 0 : Math.ceil(totalAmount / 100000) * 1000;
        const shippingCost = totalAmount > 200000 ? 0 : 25000;
        const finalTotal = totalAmount + serviceFee + shippingCost;
        const order = await prisma_1.prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    shippingAddressId: addressId,
                    totalAmount: finalTotal,
                    subtotal: totalAmount,
                    shippingFee: shippingCost,
                    serviceFee: serviceFee,
                    logisticsOption: "Standard",
                    paymentMethod: "Manual",
                    paymentStatus: "PENDING",
                    status: client_1.OrderStatus.PENDING_PAYMENT,
                    items: {
                        create: orderItemsData,
                    },
                },
                include: {
                    items: true,
                },
            });
            for (const item of fullCart.items) {
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
            return newOrder;
        });
        logger_1.default.info(`Checkout successful. Order ID: ${order.id}`);
        return order;
    }
}
exports.CheckoutService = CheckoutService;
