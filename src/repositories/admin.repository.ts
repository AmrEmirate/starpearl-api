import { prisma } from "../config/prisma";
import { Store, StoreStatus, User } from "../generated/prisma";
import logger from "../utils/logger";

export class AdminRepository {
  /**
   * Mengambil semua toko beserta data user (Seller)
   */
  async findAllStores(): Promise<(Store & { user: User })[]> {
    try {
      return await prisma.store.findMany({
        include: {
          user: true, // Sertakan data user (Seller)
        },
        orderBy: {
          status: "asc", // Tampilkan yang PENDING dulu
        },
      });
    } catch (error) {
      logger.error("Error finding all stores", error);
      throw new Error("Database query failed");
    }
  }

  /**
   * Memperbarui status sebuah toko
   */
  async updateStoreStatus(
    storeId: string,
    status: StoreStatus
  ): Promise<Store> {
    try {
      return await prisma.store.update({
        where: { id: storeId },
        data: { status: status },
      });
    } catch (error) {
      logger.error(`Error updating store status for: ${storeId}`, error);
      throw new Error("Database query failed");
    }
  }
}