import { Response, NextFunction } from "express";
import { OrderService } from "../services/order.service";
import logger from "../utils/logger";
import { RequestWithUser } from "../middleware/auth.middleware";
import AppError from "../utils/AppError";

class CheckoutController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  public checkout = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication failed", 401);
      }

      const {
        addressId,
        logisticsOption = "Standard",
        paymentMethod = "Midtrans",
        shippingCost = 25000,
        serviceFee = 0,
        totalPrice,
        voucherCode,
      } = req.body;

      if (!addressId) {
        throw new AppError("Address ID is required", 400);
      }

      if (!totalPrice) {
        throw new AppError("Total price is required", 400);
      }

      const order = await this.orderService.createOrder(req.user.id, {
        addressId,
        logisticsOption,
        paymentMethod,
        shippingCost,
        serviceFee,
        totalPrice,
      });

      res.status(201).send({
        success: true,
        message: "Order placed successfully",
        data: order,
      });
    } catch (error) {
      logger.error("Error in checkout controller", error);
      next(error);
    }
  };
}

export default CheckoutController;
