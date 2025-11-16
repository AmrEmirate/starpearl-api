import { Router } from "express";
import ProductController from "../controllers/product.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { createProductValidation } from "../middleware/validation/product";

class ProductRouter {
  private route: Router;
  private productController: ProductController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.route = Router();
    this.productController = new ProductController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoute();
  }

  private initializeRoute(): void {

    // GET /products - (Publik) Mengambil semua produk
    this.route.get(
      "/",
      this.productController.getAllProducts
    );

    // GET /products/:id - (Publik) Mengambil detail produk
    this.route.get(
      "/:id",
      this.productController.getProductById
    );
    // Rute POST /products
    // Dilindungi: Harus login (verifyToken) dan harus SELLER (isSeller)
    this.route.post(
      "/",
      this.authMiddleware.verifyToken,
      this.authMiddleware.isSeller, // Middleware otorisasi untuk seller
      createProductValidation,      // Middleware validasi
      this.productController.createProduct
    );

    // Rute lain (GET /, GET /:id, PATCH /:id, DELETE /:id) akan ditambahkan di sini
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default ProductRouter;