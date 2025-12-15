"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressRepository = void 0;
const prisma_1 = require("../config/prisma");
const logger_1 = __importDefault(require("../utils/logger"));
class AddressRepository {
    /**
     * Menambahkan alamat baru untuk user.
     */
    async createAddress(data) {
        try {
            if (data.isDefault) {
                await prisma_1.prisma.address.updateMany({
                    where: { userId: data.userId, isDefault: true },
                    data: { isDefault: false },
                });
            }
            return await prisma_1.prisma.address.create({
                data,
            });
        }
        catch (error) {
            logger_1.default.error(`Error creating address for user: ${data.userId}`, error);
            throw new Error("Database query failed while creating address");
        }
    }
    /**
     * Mengambil semua alamat milik seorang user.
     */
    async findAddressesByUserId(userId) {
        try {
            return await prisma_1.prisma.address.findMany({
                where: { userId: userId },
                orderBy: {
                    isDefault: "desc", // Tampilkan yang default di paling atas
                },
            });
        }
        catch (error) {
            logger_1.default.error(`Error finding addresses for user: ${userId}`, error);
            throw new Error("Database query failed");
        }
    }
    /**
     * Menemukan alamat spesifik milik user.
     */
    async findAddressById(addressId, userId) {
        try {
            return await prisma_1.prisma.address.findFirst({
                where: { id: addressId, userId: userId },
            });
        }
        catch (error) {
            logger_1.default.error(`Error finding address: ${addressId}`, error);
            throw new Error("Database query failed");
        }
    }
    /**
     * Memperbarui data alamat.
     */
    async updateAddress(addressId, data, userId) {
        try {
            if (data.isDefault) {
                await prisma_1.prisma.address.updateMany({
                    where: { userId: userId, isDefault: true },
                    data: { isDefault: false },
                });
            }
            return await prisma_1.prisma.address.update({
                where: { id: addressId },
                data,
            });
        }
        catch (error) {
            logger_1.default.error(`Error updating address: ${addressId}`, error);
            throw new Error("Database query failed");
        }
    }
    /**
     * Menghapus alamat.
     */
    async deleteAddress(addressId) {
        try {
            return await prisma_1.prisma.address.delete({
                where: { id: addressId },
            });
        }
        catch (error) {
            logger_1.default.error(`Error deleting address: ${addressId}`, error);
            throw new Error("Database query failed");
        }
    }
}
exports.AddressRepository = AddressRepository;
