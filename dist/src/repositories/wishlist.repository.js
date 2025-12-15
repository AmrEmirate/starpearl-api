"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistRepository = void 0;
const prisma_1 = require("../config/prisma");
const logger_1 = __importDefault(require("../utils/logger"));
class WishlistRepository {
    async getWishlistByUserId(userId) {
        try {
            return await prisma_1.prisma.wishlist.findUnique({
                where: { userId },
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
                        orderBy: { createdAt: "desc" },
                    },
                },
            });
        }
        catch (error) {
            logger_1.default.error(`Error finding wishlist for user: ${userId}`, error);
            throw new Error("Database query failed");
        }
    }
    async createWishlist(userId) {
        try {
            return await prisma_1.prisma.wishlist.create({
                data: { userId },
            });
        }
        catch (error) {
            logger_1.default.error(`Error creating wishlist for user: ${userId}`, error);
            throw new Error("Database query failed");
        }
    }
    async addItem(wishlistId, productId) {
        try {
            return await prisma_1.prisma.wishlistItem.create({
                data: {
                    wishlistId,
                    productId,
                },
            });
        }
        catch (error) {
            logger_1.default.error("Error adding item to wishlist", error);
            throw new Error("Database query failed");
        }
    }
    async removeItem(wishlistId, productId) {
        try {
            await prisma_1.prisma.wishlistItem.deleteMany({
                where: {
                    wishlistId,
                    productId,
                },
            });
        }
        catch (error) {
            logger_1.default.error("Error removing item from wishlist", error);
            throw new Error("Database query failed");
        }
    }
    async findItem(wishlistId, productId) {
        try {
            return await prisma_1.prisma.wishlistItem.findUnique({
                where: {
                    wishlistId_productId: {
                        wishlistId,
                        productId,
                    },
                },
            });
        }
        catch (error) {
            logger_1.default.error("Error finding wishlist item", error);
            throw new Error("Database query failed");
        }
    }
}
exports.WishlistRepository = WishlistRepository;
