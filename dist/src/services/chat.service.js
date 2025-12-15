"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const prisma_1 = require("../config/prisma");
const AppError_1 = __importDefault(require("../utils/AppError"));
class ChatService {
    async getOrCreateRoom(buyerId, storeId) {
        let room = await prisma_1.prisma.chatRoom.findUnique({
            where: {
                buyerId_storeId: {
                    buyerId,
                    storeId,
                },
            },
        });
        if (!room) {
            room = await prisma_1.prisma.chatRoom.create({
                data: {
                    buyerId,
                    storeId,
                },
            });
        }
        return room;
    }
    async getUserRooms(userId, role) {
        if (role === "SELLER") {
            const store = await prisma_1.prisma.store.findUnique({ where: { userId } });
            if (!store)
                throw new AppError_1.default("Store not found", 404);
            return prisma_1.prisma.chatRoom.findMany({
                where: { storeId: store.id },
                include: {
                    buyer: { select: { id: true, name: true, avatarUrl: true } },
                    messages: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                    },
                },
                orderBy: { updatedAt: "desc" },
            });
        }
        else {
            return prisma_1.prisma.chatRoom.findMany({
                where: { buyerId: userId },
                include: {
                    store: { select: { id: true, name: true, logoUrl: true } },
                    messages: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                    },
                },
                orderBy: { updatedAt: "desc" },
            });
        }
    }
    async getRoomMessages(roomId) {
        return prisma_1.prisma.chatMessage.findMany({
            where: { chatRoomId: roomId },
            orderBy: { createdAt: "asc" },
        });
    }
    async sendMessage(roomId, senderId, content) {
        const room = await prisma_1.prisma.chatRoom.findUnique({ where: { id: roomId } });
        if (!room)
            throw new AppError_1.default("Room not found", 404);
        await prisma_1.prisma.chatRoom.update({
            where: { id: roomId },
            data: { updatedAt: new Date() },
        });
        return prisma_1.prisma.chatMessage.create({
            data: {
                chatRoomId: roomId,
                senderId,
                content,
            },
        });
    }
}
exports.ChatService = ChatService;
