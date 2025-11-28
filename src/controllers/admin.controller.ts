import { Response, NextFunction } from "express";
import { AdminService } from "../services/admin.service";
import { RequestWithUser } from "../middleware/auth.middleware";
import AppError from "../utils/AppError";

class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  public getStats = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const stats = await this.adminService.getDashboardStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  };

  public getPendingStores = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const stores = await this.adminService.getPendingStores();
      res.status(200).json({ success: true, data: stores });
    } catch (error) {
      next(error);
    }
  };

  public verifyStore = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["APPROVED", "REJECTED"].includes(status)) {
        throw new AppError("Invalid status", 400);
      }

      const store = await this.adminService.verifyStore(id, status);
      res.status(200).json({ success: true, data: store });
    } catch (error) {
      next(error);
    }
  };

  public getPendingWithdrawals = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const withdrawals = await this.adminService.getPendingWithdrawals();
      res.status(200).json({ success: true, data: withdrawals });
    } catch (error) {
      next(error);
    }
  };

  public processWithdrawal = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["APPROVED", "REJECTED"].includes(status)) {
        throw new AppError("Invalid status", 400);
      }

      const withdrawal = await this.adminService.processWithdrawal(id, status);
      res.status(200).json({ success: true, data: withdrawal });
    } catch (error) {
      next(error);
    }
  };
}

export default AdminController;
