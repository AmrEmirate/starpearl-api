import { prisma } from "../config/prisma";
import { User } from "@prisma/client";
import logger from "../utils/logger";

export class UserRepository {
  async findUserById(userId: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { id: userId },
      });
    } catch (error) {
      logger.error(`Error finding user by id: ${userId}`, error);
      throw new Error("Database query failed");
    }
  }

  async updateUser(
    userId: string,
    data: Partial<Pick<User, "name" | "passwordHash">>
  ): Promise<User> {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data,
      });
    } catch (error) {
      logger.error(`Error updating user: ${userId}`, error);
      throw new Error("Database query failed");
    }
  }
}
