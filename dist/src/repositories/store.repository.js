"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreRepository = void 0;
const prisma_1 = require("../config/prisma");
const logger_1 = __importDefault(require("../utils/logger"));
class StoreRepository {
    async findStoreByUserId(userId) {
        try {
            return await prisma_1.prisma.store.findUnique({
                where: { userId },
            });
        }
        catch (error) {
            logger_1.default.error(`Error finding store for user: ${userId}`, error);
            throw new Error("Database query failed while finding store");
        }
    }
    async findById(storeId) {
        try {
            return await prisma_1.prisma.store.findUnique({
                where: { id: storeId },
            });
        }
        catch (error) {
            logger_1.default.error(`Error finding store by ID: ${storeId}`, error);
            throw new Error("Database query failed while finding store");
        }
    }
    async updateStore(storeId, data) {
        try {
            return await prisma_1.prisma.store.update({
                where: { id: storeId },
                data,
            });
        }
        catch (error) {
            logger_1.default.error(`Error updating store: ${storeId}`, error);
            throw new Error("Database query failed while updating store");
        }
    }
}
exports.StoreRepository = StoreRepository;
