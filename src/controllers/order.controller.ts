import { Request, Response, NextFunction } from "express";
import { OrderService } from "../services/order.service";
import logger from "../utils/logger";
import { RequestWithUser } from "../middleware/auth.middleware";
import AppError from "../utils/AppError";

class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  public createOrder = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication failed", 401);
      }

      const result = await this.orderService.createOrder(req.user.id, req.body);
      
      res.status(201).send({
        success: true,
        message: "Order created successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Error in createOrder controller", error);
      next(error);
    }
  };

  // Handler lain (getOrders, getOrderDetails) akan ditambahkan di sini
}

export default OrderController;