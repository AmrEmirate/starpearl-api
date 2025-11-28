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
    // GET /products - (Publik) Mengambil semua produk
    this.route.get("/", this.productController.getAllProducts);

    // GET /products/my-products - (Seller) Mengambil produk toko sendiri
    this.route.get(
      "/my-products",
      this.authMiddleware.verifyToken,
      this.authMiddleware.isSeller,
      this.productController.getMyProducts
    );

    // GET /products/:id - (Publik) Mengambil detail produk
    this.route.get("/:id", this.productController.getProductById);
    // Rute POST /products
    // Dilindungi: Harus login (verifyToken) dan harus SELLER (isSeller)
    this.route.post(
      "/",
      this.authMiddleware.verifyToken,
      this.authMiddleware.isSeller, // Middleware otorisasi untuk seller
      createProductValidation, // Middleware validasi
      this.productController.createProduct
    );

    // PATCH /products/:id - (Seller) Update produk
    this.route.patch(
      "/:id",
      this.authMiddleware.verifyToken,
      this.authMiddleware.isSeller,
      this.productController.updateProduct
    );

    // DELETE /products/:id - (Seller) Hapus produk
    this.route.delete(
      "/:id",
      this.authMiddleware.verifyToken,
      this.authMiddleware.isSeller,
      this.productController.deleteProduct
    );

    // --- Reviews ---

    // GET /products/:id/reviews - (Publik) Mengambil review produk
    this.route.get("/:id/reviews", this.reviewController.getProductReviews);

    // POST /products/:id/reviews - (Buyer) Menambah review
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
