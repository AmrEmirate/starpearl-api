import { Response, NextFunction } from "express";
import { StoreService } from "../services/store.service";
import logger from "../utils/logger";
import { RequestWithUser } from "../middleware/auth.middleware";
import AppError from "../utils/AppError";

class StoreController {
  private storeService: StoreService;

  constructor() {
    this.storeService = new StoreService();
  }

  public getMyStore = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication failed", 401);
      }

      const result = await this.storeService.getMyStore(req.user.id);

      res.status(200).send({
        success: true,
        message: "Store profile retrieved successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Error in getMyStore controller", error);
      next(error);
    }
  };

  public updateMyStore = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication failed", 401);
      }

      const result = await this.storeService.updateMyStore(
        req.user.id,
        req.body
      );

      res.status(200).send({
        success: true,
        message: "Store profile updated successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Error in updateMyStore controller", error);
      next(error);
    }
  };

  public getDashboardStats = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication failed", 401);
      }

      // First get the store ID for this user
      const store = await this.storeService.getMyStore(req.user.id);
      if (!store) {
        throw new AppError("Store not found", 404);
      }

      const AnalyticsService =
        require("../services/analytics.service").AnalyticsService;
      const analyticsService = new AnalyticsService();
      const stats = await analyticsService.getStoreStats(store.id);

      res.status(200).send({
        success: true,
        message: "Dashboard stats retrieved successfully",
        data: stats,
      });
    } catch (error) {
      logger.error("Error in getDashboardStats controller", error);
      next(error);
    }
  };

  public submitVerification = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication failed", 401);
      }

      const { idCardUrl, businessLicenseUrl } = req.body;

      if (!idCardUrl || !businessLicenseUrl) {
        throw new AppError(
          "ID Card and Business License URLs are required",
          400
        );
      }

      const result = await this.storeService.submitVerification(req.user.id, {
        idCardUrl,
        businessLicenseUrl,
      });

      res.status(200).send({
        success: true,
        message: "Verification submitted successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Error in submitVerification controller", error);
      next(error);
    }
  };
}

export default StoreController;
