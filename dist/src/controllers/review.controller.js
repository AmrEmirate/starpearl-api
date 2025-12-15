"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const review_service_1 = require("../services/review.service");
const logger_1 = __importDefault(require("../utils/logger"));
const AppError_1 = __importDefault(require("../utils/AppError"));
class ReviewController {
    reviewService;
    constructor() {
        this.reviewService = new review_service_1.ReviewService();
    }
    addReview = async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError_1.default("Authentication failed", 401);
            }
            const { id: productId } = req.params;
            const { rating, content } = req.body;
            const result = await this.reviewService.addReview(req.user.id, productId, rating, content);
            res.status(201).send({
                success: true,
                message: "Review added successfully",
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in addReview controller", error);
            next(error);
        }
    };
    getProductReviews = async (req, res, next) => {
        try {
            const { id: productId } = req.params;
            const result = await this.reviewService.getProductReviews(productId);
            res.status(200).send({
                success: true,
                message: "Reviews retrieved successfully",
                data: result,
            });
        }
        catch (error) {
            logger_1.default.error("Error in getProductReviews controller", error);
            next(error);
        }
    };
}
exports.default = ReviewController;
