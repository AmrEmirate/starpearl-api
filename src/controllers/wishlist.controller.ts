import { Response, NextFunction } from "express";
import { WishlistService } from "../services/wishlist.service";
import logger from "../utils/logger";
import { RequestWithUser } from "../middleware/auth.middleware";
import AppError from "../utils/AppError";

class WishlistController {
  private wishlistService: WishlistService;

  constructor() {
    this.wishlistService = new WishlistService();
  }

  public getMyWishlist = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication failed", 401);
      }

      const result = await this.wishlistService.getMyWishlist(req.user.id);

      res.status(200).send({
        success: true,
        message: "Wishlist retrieved successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Error in getMyWishlist controller", error);
      next(error);
    }
  };

  public addToWishlist = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication failed", 401);
      }

      const { productId } = req.body;
      if (!productId) {
        throw new AppError("Product ID is required", 400);
      }

      const result = await this.wishlistService.addToWishlist(
        req.user.id,
        productId
      );

      res.status(201).send({
        success: true,
        message: "Added to wishlist successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Error in addToWishlist controller", error);
      next(error);
    }
  };

  public removeFromWishlist = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication failed", 401);
      }

      const { id: productId } = req.params;
      await this.wishlistService.removeFromWishlist(req.user.id, productId);

      res.status(200).send({
        success: true,
        message: "Removed from wishlist successfully",
      });
    } catch (error) {
      logger.error("Error in removeFromWishlist controller", error);
      next(error);
    }
  };
}

export default WishlistController;
