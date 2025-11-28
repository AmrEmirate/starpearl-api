import { Request, Response, NextFunction } from "express";
import { ReviewService } from "../services/review.service";
import logger from "../utils/logger";
import { RequestWithUser } from "../middleware/auth.middleware";
import AppError from "../utils/AppError";

class ReviewController {
  private reviewService: ReviewService;

  constructor() {
    this.reviewService = new ReviewService();
  }

  public addReview = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication failed", 401);
      }

      const { id: productId } = req.params;
      const { rating, content } = req.body;

      const result = await this.reviewService.addReview(
        req.user.id,
        productId,
        rating,
        content
      );

      res.status(201).send({
        success: true,
        message: "Review added successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Error in addReview controller", error);
      next(error);
    }
  };

  public getProductReviews = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id: productId } = req.params;
      const result = await this.reviewService.getProductReviews(productId);

      res.status(200).send({
        success: true,
        message: "Reviews retrieved successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Error in getProductReviews controller", error);
      next(error);
    }
  };
}

export default ReviewController;
