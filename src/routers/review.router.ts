import { Router } from "express";
import ReviewController from "../controllers/review.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

class ReviewRouter {
  private route: Router;
  private reviewController: ReviewController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.route = Router();
    this.reviewController = new ReviewController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoute();
  }

  private initializeRoute(): void {
    // GET /reviews/:id - Get reviews for a product (Public)
    this.route.get("/:id", this.reviewController.getProductReviews);

    // POST /reviews/:id - Add a review (Protected)
    this.route.post(
      "/:id",
      this.authMiddleware.verifyToken,
      this.reviewController.addReview
    );
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default ReviewRouter;
