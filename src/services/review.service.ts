import { ReviewRepository } from "../repositories/review.repository";
import { OrderRepository } from "../repositories/order.repository";
import { Review } from "../generated/prisma";
import AppError from "../utils/AppError";
import logger from "../utils/logger";
import { prisma } from "../config/prisma";

export class ReviewService {
  private reviewRepository: ReviewRepository;
  private orderRepository: OrderRepository;

  constructor() {
    this.reviewRepository = new ReviewRepository();
    this.orderRepository = new OrderRepository();
  }

  public async addReview(
    userId: string,
    productId: string,
    rating: number,
    content?: string
  ): Promise<Review> {
    logger.info(`Adding review for product ${productId} by user ${userId}`);

    // 1. Validasi Rating
    if (rating < 1 || rating > 5) {
      throw new AppError("Rating must be between 1 and 5", 400);
    }

    // 2. Cek apakah user sudah pernah membeli produk ini dan statusnya DELIVERED
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId: productId,
        order: {
          userId: userId,
          status: "DELIVERED", // Hanya boleh review jika sudah diterima
        },
      },
    });

    if (!hasPurchased) {
      throw new AppError(
        "You can only review products you have purchased and received.",
        403
      );
    }

    // 3. Cek apakah sudah pernah review (opsional, tapi bagus untuk mencegah spam)
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        productId,
      },
    });

    if (existingReview) {
      throw new AppError("You have already reviewed this product", 400);
    }

    return this.reviewRepository.createReview({
      userId,
      productId,
      rating,
      content,
    });
  }

  public async getProductReviews(productId: string): Promise<Review[]> {
    return this.reviewRepository.findReviewsByProductId(productId);
  }
}
