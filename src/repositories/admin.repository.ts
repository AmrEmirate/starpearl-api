import { prisma } from "../config/prisma";
import { Store, StoreStatus, User, CommunityPost } from "../generated/prisma";
import logger from "../utils/logger";

export class AdminRepository {
  /**
   * Mengambil semua toko beserta data user (Seller)
   */
  async findAllStores(
    status?: StoreStatus
  ): Promise<(Store & { user: User })[]> {
    try {
      const where = status ? { status } : {};
      return await prisma.store.findMany({
        where,
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

  /**
   * Mengambil semua postingan komunitas yang statusnya PENDING
   */
  async findPendingPosts(): Promise<(CommunityPost & { user: User })[]> {
    try {
      return await prisma.communityPost.findMany({
        where: { status: "PENDING" },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      logger.error("Error finding pending posts", error);
      throw new Error("Database query failed");
    }
  }

  /**
   * Memperbarui status postingan komunitas
   */
  async updatePostStatus(
    postId: string,
    status: "APPROVED" | "REJECTED"
  ): Promise<CommunityPost> {
    try {
      return await prisma.communityPost.update({
        where: { id: postId },
        data: { status: status },
      });
    } catch (error) {
      logger.error(`Error updating post status for: ${postId}`, error);
      throw new Error("Database query failed");
    }
  }
}
