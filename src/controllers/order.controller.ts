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

  public getMyOrders = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication failed", 401);
      }

      const result = await this.orderService.getMyOrders(req.user.id);

      res.status(200).send({
        success: true,
        message: "Orders retrieved successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Error in getMyOrders controller", error);
      next(error);
    }
  };

  public getStoreOrders = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication failed", 401);
      }

      const result = await this.orderService.getStoreOrders(req.user.id);

      res.status(200).send({
        success: true,
        message: "Store orders retrieved successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Error in getStoreOrders controller", error);
      next(error);
    }
  };

  public updateOrderStatus = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication failed", 401);
      }

      const { id } = req.params;
      const { status, shippingResi } = req.body;

      if (!status) {
        throw new AppError("Status is required", 400);
      }

      const result = await this.orderService.updateOrderStatus(
        req.user.id,
        id,
        status,
        shippingResi
      );

      res.status(200).send({
        success: true,
        message: "Order status updated successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Error in updateOrderStatus controller", error);
      next(error);
    }
  };

  public confirmOrderReceived = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication failed", 401);
      }

      const { id } = req.params;

      const result = await this.orderService.confirmOrderReceived(
        req.user.id,
        id
      );

      res.status(200).send({
        success: true,
        message: "Order confirmed as received",
        data: result,
      });
    } catch (error) {
      logger.error("Error in confirmOrderReceived controller", error);
      next(error);
    }
  };
}

export default OrderController;
