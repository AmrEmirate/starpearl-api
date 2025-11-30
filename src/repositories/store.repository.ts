import { prisma } from "../config/prisma";
import { Store } from "../generated/prisma";
import logger from "../utils/logger";

export class StoreRepository {
  async findStoreByUserId(userId: string): Promise<Store | null> {
    try {
      return await prisma.store.findUnique({
        where: { userId },
      });
    } catch (error) {
      logger.error(`Error finding store for user: ${userId}`, error);
      throw new Error("Database query failed while finding store");
    }
  }

  async findById(storeId: string): Promise<Store | null> {
    try {
      return await prisma.store.findUnique({
        where: { id: storeId },
      });
    } catch (error) {
      logger.error(`Error finding store by ID: ${storeId}`, error);
      throw new Error("Database query failed while finding store");
    }
  }

  async updateStore(storeId: string, data: Partial<Store>): Promise<Store> {
    try {
      return await prisma.store.update({
        where: { id: storeId },
        data,
      });
    } catch (error) {
      logger.error(`Error updating store: ${storeId}`, error);
      throw new Error("Database query failed while updating store");
    }
  }
}
