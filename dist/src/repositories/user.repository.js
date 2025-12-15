"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const prisma_1 = require("../config/prisma");
const logger_1 = __importDefault(require("../utils/logger"));
class UserRepository {
    async findUserById(userId) {
        try {
            return await prisma_1.prisma.user.findUnique({
                where: { id: userId },
            });
        }
        catch (error) {
            logger_1.default.error(`Error finding user by id: ${userId}`, error);
            throw new Error("Database query failed");
        }
    }
    async updateUser(userId, data) {
        try {
            return await prisma_1.prisma.user.update({
                where: { id: userId },
                data,
            });
        }
        catch (error) {
            logger_1.default.error(`Error updating user: ${userId}`, error);
            throw new Error("Database query failed");
        }
    }
}
exports.UserRepository = UserRepository;
