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
    this.route.use(this.authMiddleware.verifyToken);

    this.route.post(
      "/",
      createOrderValidation, // Terapkan validasi
      this.orderController.createOrder
    );

    this.route.get("/", this.orderController.getMyOrders);

    this.route.get(
      "/store-orders",
      this.authMiddleware.isSeller,
      this.orderController.getStoreOrders
    );

    this.route.patch(
      "/:id/status",
      this.authMiddleware.isSeller,
      this.orderController.updateOrderStatus
    );

    // Buyer confirms order received
    this.route.patch(
      "/:id/confirm-received",
      this.orderController.confirmOrderReceived
    );
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default OrderRouter;
