import { prisma } from "../config/prisma";
import { Wishlist, WishlistItem } from "@prisma/client";
import logger from "../utils/logger";

export class WishlistRepository {
  async getWishlistByUserId(userId: string): Promise<Wishlist | null> {
    try {
      return await prisma.wishlist.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  store: {
                    select: { name: true },
                  },
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });
    } catch (error) {
      logger.error(`Error finding wishlist for user: ${userId}`, error);
      throw new Error("Database query failed");
    }
  }

  async createWishlist(userId: string): Promise<Wishlist> {
    try {
      return await prisma.wishlist.create({
        data: { userId },
      });
    } catch (error) {
      logger.error(`Error creating wishlist for user: ${userId}`, error);
      throw new Error("Database query failed");
    }
  }

  async addItem(wishlistId: string, productId: string): Promise<WishlistItem> {
    try {
      return await prisma.wishlistItem.create({
        data: {
          wishlistId,
          productId,
        },
      });
    } catch (error) {
      logger.error("Error adding item to wishlist", error);
      throw new Error("Database query failed");
    }
  }

  async removeItem(wishlistId: string, productId: string): Promise<void> {
    try {
      await prisma.wishlistItem.deleteMany({
        where: {
          wishlistId,
          productId,
        },
      });
    } catch (error) {
      logger.error("Error removing item from wishlist", error);
      throw new Error("Database query failed");
    }
  }

  async findItem(
    wishlistId: string,
    productId: string
  ): Promise<WishlistItem | null> {
    try {
      return await prisma.wishlistItem.findUnique({
        where: {
          wishlistId_productId: {
            wishlistId,
            productId,
          },
        },
      });
    } catch (error) {
      logger.error("Error finding wishlist item", error);
      throw new Error("Database query failed");
    }
  }
}
