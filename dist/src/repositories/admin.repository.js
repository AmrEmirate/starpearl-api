"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRepository = void 0;
const prisma_1 = require("../config/prisma");
const logger_1 = __importDefault(require("../utils/logger"));
class AdminRepository {
    /**
     * Mengambil semua toko beserta data user (Seller)
     */
    async findAllStores(status) {
        try {
            const where = status ? { status } : {};
            return await prisma_1.prisma.store.findMany({
                where,
                include: {
                    user: true, // Sertakan data user (Seller)
                },
                orderBy: {
                    status: "asc", // Tampilkan yang PENDING dulu
                },
            });
        }
        catch (error) {
            logger_1.default.error("Error finding all stores", error);
            throw new Error("Database query failed");
        }
    }
    /**
     * Memperbarui status sebuah toko
     */
    async updateStoreStatus(storeId, status) {
        try {
            return await prisma_1.prisma.store.update({
                where: { id: storeId },
                data: { status: status },
            });
        }
        catch (error) {
            logger_1.default.error(`Error updating store status for: ${storeId}`, error);
            throw new Error("Database query failed");
        }
    }
    /**
     * Mengambil semua postingan komunitas yang statusnya PENDING
     */
    async findPendingPosts() {
        try {
            return await prisma_1.prisma.communityPost.findMany({
                where: { status: "PENDING" },
                include: {
                    user: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        }
        catch (error) {
            logger_1.default.error("Error finding pending posts", error);
            throw new Error("Database query failed");
        }
    }
    /**
     * Memperbarui status postingan komunitas
     */
    async updatePostStatus(postId, status) {
        try {
            return await prisma_1.prisma.communityPost.update({
                where: { id: postId },
                data: { status: status },
            });
        }
        catch (error) {
            logger_1.default.error(`Error updating post status for: ${postId}`, error);
            throw new Error("Database query failed");
        }
    }
}
exports.AdminRepository = AdminRepository;
