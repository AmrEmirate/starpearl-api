"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreService = void 0;
const store_repository_1 = require("../repositories/store.repository");
const prisma_1 = require("../config/prisma");
const AppError_1 = __importDefault(require("../utils/AppError"));
const logger_1 = __importDefault(require("../utils/logger"));
class StoreService {
    storeRepository;
    constructor() {
        this.storeRepository = new store_repository_1.StoreRepository();
    }
    async getMyStore(userId) {
        logger_1.default.info(`Fetching store for user: ${userId}`);
        const store = await this.storeRepository.findStoreByUserId(userId);
        if (!store) {
            throw new AppError_1.default("Store not found for this user", 404);
        }
        return store;
    }
    async updateMyStore(userId, data) {
        logger_1.default.info(`Updating store for user: ${userId}`);
        const store = await this.storeRepository.findStoreByUserId(userId);
        if (!store) {
            throw new AppError_1.default("Store not found for this user", 404);
        }
        const updateData = { ...data };
        delete updateData.id;
        delete updateData.userId;
        delete updateData.status; // Status should be updated by admin only
        return this.storeRepository.updateStore(store.id, updateData);
    }
    async submitVerification(userId, data) {
        logger_1.default.info(`Submitting verification for user: ${userId}`);
        const store = await this.storeRepository.findStoreByUserId(userId);
        if (!store) {
            throw new AppError_1.default("Store not found for this user", 404);
        }
        return this.storeRepository.updateStore(store.id, {
            idCardUrl: data.idCardUrl,
            businessLicenseUrl: data.businessLicenseUrl,
            status: "PENDING", // Reset status to PENDING for review
        });
    }
    async getStoreById(storeId) {
        const store = await prisma_1.prisma.store.findUnique({
            where: { id: storeId },
            include: {
                products: {
                    where: { isActive: true },
                    take: 10, // Limit for now
                },
            },
        });
        if (!store)
            throw new AppError_1.default("Store not found", 404);
        return store;
    }
    async followStore(userId, storeId) {
        // Check if store exists
        const store = await this.storeRepository.findById(storeId);
        if (!store)
            throw new AppError_1.default("Store not found", 404);
        // Check if already following
        const existingFollow = await prisma_1.prisma.storeFollow.findUnique({
            where: {
                userId_storeId: {
                    userId,
                    storeId,
                },
            },
        });
        if (existingFollow)
            throw new AppError_1.default("Already following this store", 400);
        return prisma_1.prisma.storeFollow.create({
            data: {
                userId,
                storeId,
            },
        });
    }
    async unfollowStore(userId, storeId) {
        return prisma_1.prisma.storeFollow.delete({
            where: {
                userId_storeId: {
                    userId,
                    storeId,
                },
            },
        });
    }
}
exports.StoreService = StoreService;
