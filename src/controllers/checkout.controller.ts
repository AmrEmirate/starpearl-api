import { Response, NextFunction } from "express";
import { CheckoutService } from "../services/checkout.service";
import logger from "../utils/logger";
import { RequestWithUser } from "../middleware/auth.middleware";
import AppError from "../utils/AppError";

class CheckoutController {
  private checkoutService: CheckoutService;

  constructor() {
    this.checkoutService = new CheckoutService();
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

      const { addressId } = req.body;

      if (!addressId) {
        throw new AppError("Address ID is required", 400);
      }

      const order = await this.checkoutService.processCheckout(
        req.user.id,
        addressId
      );

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
