import { Router } from "express";
import CheckoutController from "../controllers/checkout.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

class CheckoutRouter {
  private route: Router;
  private checkoutController: CheckoutController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.route = Router();
    this.checkoutController = new CheckoutController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoute();
  }

  private initializeRoute(): void {
    this.route.use(this.authMiddleware.verifyToken);

    // POST /checkout - Membuat pesanan dari keranjang
    this.route.post("/", this.checkoutController.checkout);
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default CheckoutRouter;
