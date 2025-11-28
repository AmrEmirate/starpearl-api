import { prisma } from "../config/prisma";
import { User, Store } from "../generated/prisma";
import AppError from "../utils/AppError";
import logger from "../utils/logger";

export class AuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      logger.error(`Error finding user by email: ${email}`, error);
      throw new Error("Database query failed");
    }
  }

  async createUser(
    data: Omit<User, "id" | "createdAt" | "updatedAt" | "avatarUrl">
  ): Promise<User> {
    try {
      return await prisma.user.create({
        data,
      });
    } catch (error) {
      logger.error(`Error creating user: ${data.email}`, error);
      throw new Error("Database query failed");
    }
  }

  async createSeller(
    userData: Omit<User, "id" | "createdAt" | "updatedAt" | "avatarUrl">,
    storeName: string
  ): Promise<User> {
    try {
      return await prisma.$transaction(async (tx) => {
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
    } catch (error) {
      logger.error(`Error creating seller: ${userData.email}`, error);
      if (
        (error as any).code === "P2002" &&
        (error as any).meta?.target?.includes("name")
      ) {
        throw new AppError("Store name already exists", 400);
      }
      throw new Error("Database transaction failed");
    }
  }

  async updateUserAvatar(userId: string, avatarUrl: string): Promise<User> {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl },
      });
    } catch (error) {
      logger.error(`Error updating avatar for user: ${userId}`, error);
      throw new Error("Database query failed");
    }
  }
}
