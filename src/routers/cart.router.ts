import { Router, Request, Response, NextFunction } from "express";
import CartController from "../controllers/cart.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { addToCartValidation } from "../middleware/validation/cart";

// Import 'body' dan 'validationResult' untuk validasi
import { body, validationResult } from "express-validator";
import AppError from "../utils/AppError";

// Kita buat handler validasi sederhana untuk update
const updateValidationHandler = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }
  next();
};

class CartRouter {
  private route: Router;
  private cartController: CartController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.route = Router();
    this.cartController = new CartController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoute();
  }

  private initializeRoute(): void {
    // Semua rute keranjang dilindungi, harus login
    this.route.use(this.authMiddleware.verifyToken);

    // GET /cart - Melihat isi keranjang
    this.route.get(
      "/",
      this.cartController.getCart
    );

    // POST /cart - Menambah item ke keranjang
    this.route.post(
      "/",
      addToCartValidation,
      this.cartController.addItem
    );

    // PATCH /cart/:itemId - Update kuantitas item
    this.route.patch(
      "/:itemId",
      // Validasi body untuk kuantitas
      body("quantity")
        .notEmpty().withMessage("Quantity is required")
        .isInt({ gt: 0 }).withMessage("Quantity must be a positive integer")
        .toInt(),
      updateValidationHandler, // Jalankan handler validasi
      this.cartController.updateItem
    );

    // DELETE /cart/:itemId - Menghapus item
    this.route.delete(
      "/:itemId",
      this.cartController.deleteItem
    );
  } // <-- Method initializeRoute() berakhir di sini

  public getRouter(): Router {
    return this.route;
  }
}

export default CartRouter;