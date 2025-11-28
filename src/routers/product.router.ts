import { Router } from "express";
import ProductController from "../controllers/product.controller";
import ReviewController from "../controllers/review.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { createProductValidation } from "../middleware/validation/product";

class ProductRouter {
  private route: Router;
  private productController: ProductController;
  private reviewController: ReviewController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.route = Router();
    this.productController = new ProductController();
    this.reviewController = new ReviewController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoute();
  }

  private initializeRoute(): void {
    this.route.get("/", this.productController.getAllProducts);

    this.route.get(
      "/my-products",
      this.authMiddleware.verifyToken,
      this.authMiddleware.isSeller,
      this.productController.getMyProducts
    );

    this.route.get("/:id", this.productController.getProductById);
    this.route.post(
      "/",
      this.authMiddleware.verifyToken,
      this.authMiddleware.isSeller,
      createProductValidation,
      this.productController.createProduct
    );

    this.route.patch(
      "/:id",
      this.authMiddleware.verifyToken,
      this.authMiddleware.isSeller,
      this.productController.updateProduct
    );

    this.route.delete(
      "/:id",
      this.authMiddleware.verifyToken,
      this.authMiddleware.isSeller,
      this.productController.deleteProduct
    );

    this.route.get("/:id/reviews", this.reviewController.getProductReviews);

    this.route.post(
      "/:id/reviews",
      this.authMiddleware.verifyToken,
      this.reviewController.addReview
    );
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default ProductRouter;
