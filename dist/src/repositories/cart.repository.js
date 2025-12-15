"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartRepository = void 0;
const prisma_1 = require("../config/prisma");
const logger_1 = __importDefault(require("../utils/logger"));
class CartRepository {
    async findCartByUserId(userId) {
        try {
            return await prisma_1.prisma.cart.findUnique({
                where: {
                    userId: userId,
                },
            });
        }
        catch (error) {
            logger_1.default.error(`Error finding cart for user: ${userId}`, error);
            throw new Error("Database query failed");
        }
    }
    async createCart(userId) {
        try {
            return await prisma_1.prisma.cart.create({
                data: {
                    userId: userId,
                },
            });
        }
        catch (error) {
            logger_1.default.error(`Error creating cart for user: ${userId}`, error);
            throw new Error("Database query failed");
        }
    }
    async findCartItem(cartId, productId) {
        try {
            return await prisma_1.prisma.cartItem.findFirst({
                where: {
                    cartId: cartId,
                    productId: productId,
                },
            });
        }
        catch (error) {
            logger_1.default.error(`Error finding cart item (product: ${productId})`, error);
            throw new Error("Database query failed");
        }
    }
    async addCartItem(cartId, productId, quantity) {
        try {
            return await prisma_1.prisma.cartItem.create({
                data: {
                    cartId: cartId,
                    productId: productId,
                    quantity: quantity,
                },
            });
        }
        catch (error) {
            logger_1.default.error(`Error adding cart item (product: ${productId})`, error);
            throw new Error("Database query failed");
        }
    }
    async updateCartItemQuantity(cartItemId, newQuantity) {
        try {
            return await prisma_1.prisma.cartItem.update({
                where: { id: cartItemId },
                data: { quantity: newQuantity },
            });
        }
        catch (error) {
            logger_1.default.error(`Error updating cart item: ${cartItemId}`, error);
            throw new Error("Database query failed");
        }
    }
    async getFullCart(cartId) {
        try {
            return (await prisma_1.prisma.cart.findUnique({
                where: { id: cartId },
                include: {
                    items: {
                        include: {
                            product: {
                                include: {
                                    store: {
                                        select: { name: true },
                                    },
                                },
                            },
                        },
                    },
                },
            }));
        }
        catch (error) {
            logger_1.default.error(`Error getting full cart: ${cartId}`, error);
            throw new Error("Database query failed");
        }
    }
    async findCartItemByIdAndUserId(itemId, userId) {
        try {
            return await prisma_1.prisma.cartItem.findFirst({
                where: {
                    id: itemId,
                    cart: {
                        userId: userId,
                    },
                },
            });
        }
        catch (error) {
            logger_1.default.error(`Error finding cart item by id: ${itemId}`, error);
            throw new Error("Database query failed");
        }
    }
    async deleteCartItem(itemId) {
        try {
            return await prisma_1.prisma.cartItem.delete({
                where: { id: itemId },
            });
        }
        catch (error) {
            logger_1.default.error(`Error deleting cart item: ${itemId}`, error);
            throw new Error("Database query failed");
        }
    }
}
exports.CartRepository = CartRepository;
