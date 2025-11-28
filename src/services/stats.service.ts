import { prisma } from "../config/prisma";

export class StatsService {
  async getStats() {
    const totalProducts = await prisma.product.count();

    const totalUsers = await prisma.user.count();

    const avgRatingResult = await prisma.review.aggregate({
      _avg: {
        rating: true,
      },
    });

    const averageRating = avgRatingResult._avg.rating || 0;

    return {
      totalProducts,
      totalUsers,
      averageRating: Number(averageRating.toFixed(1)),
    };
  }
}
