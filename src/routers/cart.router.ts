import { Router, Request, Response, NextFunction } from "express";
import CartController from "../controllers/cart.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { addToCartValidation } from "../middleware/validation/cart";

import { body, validationResult } from "express-validator";
import AppError from "../utils/AppError";

const updateValidationHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
    this.route.use(this.authMiddleware.verifyToken);

    this.route.get("/", this.cartController.getCart);

    this.route.post("/", addToCartValidation, this.cartController.addItem);

    this.route.patch(
      "/:itemId",
      body("quantity")
        .notEmpty()
        .withMessage("Quantity is required")
        .isInt({ gt: 0 })
        .withMessage("Quantity must be a positive integer")
        .toInt(),
      updateValidationHandler,
      this.cartController.updateItem
    );

    this.route.delete("/:itemId", this.cartController.deleteItem);
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default CartRouter;
