import { prisma } from "../config/prisma";
import { ChatRoom, ChatMessage } from "../generated/prisma";
import AppError from "../utils/AppError";
import logger from "../utils/logger";

export class ChatService {
  // Get or Create Chat Room between Buyer and Store
  public async getOrCreateRoom(
    buyerId: string,
    storeId: string
  ): Promise<ChatRoom> {
    let room = await prisma.chatRoom.findUnique({
      where: {
        buyerId_storeId: {
          buyerId,
          storeId,
        },
      },
    });

    if (!room) {
      room = await prisma.chatRoom.create({
        data: {
          buyerId,
          storeId,
        },
      });
    }

    return room;
  }

  // Get User's Chat Rooms
  public async getUserRooms(
    userId: string,
    role: "BUYER" | "SELLER"
  ): Promise<any[]> {
    if (role === "SELLER") {
      // Find store first
      const store = await prisma.store.findUnique({ where: { userId } });
      if (!store) throw new AppError("Store not found", 404);

      return prisma.chatRoom.findMany({
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
    } else {
      return prisma.chatRoom.findMany({
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

  // Get Messages in a Room
  public async getRoomMessages(roomId: string): Promise<ChatMessage[]> {
    return prisma.chatMessage.findMany({
      where: { chatRoomId: roomId },
      orderBy: { createdAt: "asc" },
    });
  }

  // Send Message
  public async sendMessage(
    roomId: string,
    senderId: string,
    content: string
  ): Promise<ChatMessage> {
    const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
    if (!room) throw new AppError("Room not found", 404);

    // Update room timestamp
    await prisma.chatRoom.update({
      where: { id: roomId },
      data: { updatedAt: new Date() },
    });

    return prisma.chatMessage.create({
      data: {
        chatRoomId: roomId,
        senderId,
        content,
      },
    });
  }
}
