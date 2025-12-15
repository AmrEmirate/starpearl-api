"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const prisma_1 = require("../config/prisma");
const AppError_1 = __importDefault(require("../utils/AppError"));
const logger_1 = __importDefault(require("../utils/logger"));
class AuthRepository {
    async findUserByEmail(email) {
        try {
            return await prisma_1.prisma.user.findUnique({
                where: { email },
            });
        }
        catch (error) {
            logger_1.default.error(`Error finding user by email: ${email}`, error);
            throw new Error("Database query failed");
        }
    }
    async createUser(data) {
        try {
            return await prisma_1.prisma.user.create({
                data,
            });
        }
        catch (error) {
            logger_1.default.error(`Error creating user: ${data.email}`, error);
            throw new Error("Database query failed");
        }
    }
    async createSeller(userData, storeName) {
        try {
            return await prisma_1.prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: userData,
                });
                await tx.store.create({
                    data: {
                        userId: user.id,
                        name: storeName,
                        status: "PENDING",
                    },
                });
                return user;
            });
        }
        catch (error) {
            logger_1.default.error(`Error creating seller: ${userData.email}`, error);
            if (error.code === "P2002" &&
                error.meta?.target?.includes("name")) {
                throw new AppError_1.default("Store name already exists", 400);
            }
            throw new Error("Database transaction failed");
        }
    }
    async updateUserAvatar(userId, avatarUrl) {
        try {
            return await prisma_1.prisma.user.update({
                where: { id: userId },
                data: { avatarUrl },
            });
        }
        catch (error) {
            logger_1.default.error(`Error updating avatar for user: ${userId}`, error);
            throw new Error("Database query failed");
        }
    }
    async saveResetToken(userId, token, expires) {
        try {
            await prisma_1.prisma.user.update({
                where: { id: userId },
                data: {
                    resetPasswordToken: token,
                    resetPasswordExpires: expires,
                },
            });
        }
        catch (error) {
            logger_1.default.error(`Error saving reset token for user: ${userId}`, error);
            throw new Error("Database query failed");
        }
    }
    async findUserByResetToken(token) {
        try {
            return await prisma_1.prisma.user.findFirst({
                where: {
                    resetPasswordToken: token,
                    resetPasswordExpires: {
                        gt: new Date(),
                    },
                },
            });
        }
        catch (error) {
            logger_1.default.error(`Error finding user by reset token`, error);
            throw new Error("Database query failed");
        }
    }
}
exports.AuthRepository = AuthRepository;
