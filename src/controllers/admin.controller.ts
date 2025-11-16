import { Request, Response, NextFunction } from "express";
import { AdminService } from "../services/admin.service";
import logger from "../utils/logger";
import { RequestWithUser } from "../middleware/auth.middleware";
import AppError from "../utils/AppError";
import { StoreStatus } from "../generated/prisma";

class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  public getAllSellers = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.adminService.getAllSellers();
      res.status(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error("Error in getAllSellers controller", error);
      next(error);
    }
  };

  public updateSellerStatus = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { storeId } = req.params;
      const { status } = req.body as { status: StoreStatus };

      const result = await this.adminService.updateSellerStatus(storeId, status);
      res.status(200).send({
        success: true,
        message: "Store status updated successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Error in updateSellerStatus controller", error);
      next(error);
    }
  };
}

export default AdminController;