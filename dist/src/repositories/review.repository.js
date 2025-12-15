"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRepository = void 0;
const prisma_1 = require("../config/prisma");
const logger_1 = __importDefault(require("../utils/logger"));
class ReviewRepository {
    async createReview(data) {
        try {
            return await prisma_1.prisma.review.create({
                data,
            });
        }
        catch (error) {
            logger_1.default.error("Error creating review", error);
            throw new Error("Database query failed while creating review");
        }
    }
    async findReviewsByProductId(productId) {
        try {
            return await prisma_1.prisma.review.findMany({
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
        }
        catch (error) {
            logger_1.default.error(`Error finding reviews for product: ${productId}`, error);
            throw new Error("Database query failed while finding reviews");
        }
    }
}
exports.ReviewRepository = ReviewRepository;
