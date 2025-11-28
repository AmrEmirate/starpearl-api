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

    // GET /orders - Mendapatkan riwayat pesanan user
    this.route.get("/", this.orderController.getMyOrders);

    // GET /orders/store-orders - (Seller) Mendapatkan pesanan masuk toko
    this.route.get(
      "/store-orders",
      this.authMiddleware.isSeller,
      this.orderController.getStoreOrders
    );

    // PATCH /orders/:id/status - (Seller) Update status pesanan
    this.route.patch(
      "/:id/status",
      this.authMiddleware.isSeller,
      this.orderController.updateOrderStatus
    );
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default OrderRouter;
