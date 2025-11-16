import { Router } from "express";
import OrderController from "../controllers/order.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { createOrderValidation } from "../middleware/validation/order";

class OrderRouter {
  private route: Router;
  private orderController: OrderController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.route = Router();
    this.orderController = new OrderController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoute();
  }

  private initializeRoute(): void {
    // Lindungi semua rute order, hanya user terotentikasi yang bisa akses
    this.route.use(this.authMiddleware.verifyToken);

    // POST /orders - Membuat pesanan baru
    this.route.post(
      "/",
      createOrderValidation, // Terapkan validasi
      this.orderController.createOrder
    );

    // (Rute lain seperti GET /orders akan ditambahkan di sini)
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default OrderRouter;