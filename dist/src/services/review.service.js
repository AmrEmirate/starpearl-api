"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const review_repository_1 = require("../repositories/review.repository");
const order_repository_1 = require("../repositories/order.repository");
const AppError_1 = __importDefault(require("../utils/AppError"));
const logger_1 = __importDefault(require("../utils/logger"));
const prisma_1 = require("../config/prisma");
class ReviewService {
    reviewRepository;
    orderRepository;
    constructor() {
        this.reviewRepository = new review_repository_1.ReviewRepository();
        this.orderRepository = new order_repository_1.OrderRepository();
    }
    async addReview(userId, productId, rating, content) {
        logger_1.default.info(`Adding review for product ${productId} by user ${userId}`);
        if (rating < 1 || rating > 5) {
            throw new AppError_1.default("Rating must be between 1 and 5", 400);
        }
        const hasPurchased = await prisma_1.prisma.orderItem.findFirst({
            where: {
                productId: productId,
                order: {
                    userId: userId,
                    status: "DELIVERED", // Hanya boleh review jika sudah diterima
                },
            },
        });
        if (!hasPurchased) {
            throw new AppError_1.default("You can only review products you have purchased and received.", 403);
        }
        const existingReview = await prisma_1.prisma.review.findFirst({
            where: {
                userId,
                productId,
            },
        });
        if (existingReview) {
            throw new AppError_1.default("You have already reviewed this product", 400);
        }
        return this.reviewRepository.createReview({
            userId,
            productId,
            rating,
            content,
        });
    }
    async getProductReviews(productId) {
        return this.reviewRepository.findReviewsByProductId(productId);
    }
}
exports.ReviewService = ReviewService;
