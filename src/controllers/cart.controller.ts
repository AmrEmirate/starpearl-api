import { Request, Response, NextFunction } from "express";
import { CartService } from "../services/cart.service";
import logger from "../utils/logger";
import { RequestWithUser } from "../middleware/auth.middleware";
import AppError from "../utils/AppError";

class CartController {
  private cartService: CartService;

  constructor() {
    this.cartService = new CartService();
  }

  public addItem = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication failed", 401);
      }
      const { productId, quantity } = req.body;
      const userId = req.user.id;

      const result = await this.cartService.addItemToCart(userId, productId, quantity);
      res.status(201).send({
        success: true,
        message: "Item added to cart",
        data: result,
      });
    } catch (error) {
      logger.error("Error in addItem controller", error);
      next(error);
    }
  };

  public getCart = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication failed", 401);
      }
      const userId = req.user.id;

      const result = await this.cartService.getCart(userId);
      res.status(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error("Error in getCart controller", error);
      next(error);
    }
  };
  public updateItem = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication failed", 401);
      }
      const { itemId } = req.params;
      const { quantity } = req.body;
      const userId = req.user.id;

      if (!quantity) {
        throw new AppError("Quantity is required", 400);
      }

      const result = await this.cartService.updateItemQuantity(userId, itemId, Number(quantity));
      res.status(200).send({
        success: true,
        message: "Cart item updated",
        data: result,
      });
    } catch (error) {
      logger.error("Error in updateItem controller", error);
      next(error);
    }
  };

  public deleteItem = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication failed", 401);
      }
      const { itemId } = req.params;
      const userId = req.user.id;

      const result = await this.cartService.deleteItem(userId, itemId);
      res.status(200).send({
        success: true,
        message: "Cart item deleted",
        data: result,
      });
    } catch (error) {
      logger.error("Error in deleteItem controller", error);
      next(error);
    }
  };
}

export default CartController;
