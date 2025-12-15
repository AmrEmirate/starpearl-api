import { prisma } from "../config/prisma";
import { Review } from "@prisma/client";
import logger from "../utils/logger";

export class ReviewRepository {
  async createReview(data: {
    userId: string;
    productId: string;
    rating: number;
    content?: string;
  }): Promise<Review> {
    try {
      return await prisma.review.create({
        data,
      });
    } catch (error) {
      logger.error("Error creating review", error);
      throw new Error("Database query failed while creating review");
    }
  }

  async findReviewsByProductId(productId: string): Promise<Review[]> {
    try {
      return await prisma.review.findMany({
        where: { productId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      logger.error(`Error finding reviews for product: ${productId}`, error);
      throw new Error("Database query failed while finding reviews");
    }
  }
}
