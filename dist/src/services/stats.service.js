"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsService = void 0;
const prisma_1 = require("../config/prisma");
class StatsService {
    async getStats() {
        const totalProducts = await prisma_1.prisma.product.count();
        const totalUsers = await prisma_1.prisma.user.count();
        const avgRatingResult = await prisma_1.prisma.review.aggregate({
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
exports.StatsService = StatsService;
