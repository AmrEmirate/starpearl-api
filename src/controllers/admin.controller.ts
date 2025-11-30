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

  // Settings
  public getSettings = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const settings = await this.adminService.getSettings();
      res.status(200).json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  };

  public updateSettings = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const settings = await this.adminService.updateSettings(req.body);
      res.status(200).json({ success: true, data: settings });
    } catch (error) {
      next(error);
    }
  };

  // Content
  public getBanners = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const banners = await this.adminService.getBanners();
      res.status(200).json({ success: true, data: banners });
    } catch (error) {
      next(error);
    }
  };

  public createBanner = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const banner = await this.adminService.createBanner(req.body);
      res.status(201).json({ success: true, data: banner });
    } catch (error) {
      next(error);
    }
  };

  public updateBanner = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const banner = await this.adminService.updateBanner(id, req.body);
      res.status(200).json({ success: true, data: banner });
    } catch (error) {
      next(error);
    }
  };

  public deleteBanner = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      await this.adminService.deleteBanner(id);
      res.status(200).json({ success: true, message: "Banner deleted" });
    } catch (error) {
      next(error);
    }
  };

  // Promotions
  public getPromotions = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const promotions = await this.adminService.getPromotions();
      res.status(200).json({ success: true, data: promotions });
    } catch (error) {
      next(error);
    }
  };

  public createPromotion = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const promotion = await this.adminService.createPromotion(req.body);
      res.status(201).json({ success: true, data: promotion });
    } catch (error) {
      next(error);
    }
  };

  public updatePromotion = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const promotion = await this.adminService.updatePromotion(id, req.body);
      res.status(200).json({ success: true, data: promotion });
    } catch (error) {
      next(error);
    }
  };

  public deletePromotion = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      await this.adminService.deletePromotion(id);
      res.status(200).json({ success: true, message: "Promotion deleted" });
    } catch (error) {
      next(error);
    }
  };

  // Community Moderation
  public getPendingPosts = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.adminService.getPendingPosts();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public moderatePost = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await this.adminService.moderatePost(id, status);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  // Disputes
  public getDisputes = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.adminService.getDisputes();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public resolveDispute = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = await this.adminService.resolveDispute(id, { status });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  // User Management
  public getAllUsers = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { role, search, page, limit } = req.query;
      const result = await this.adminService.getAllUsers({
        role: role as string,
        search: search as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public suspendUser = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const result = await this.adminService.suspendUser(id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public deleteUser = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const result = await this.adminService.deleteUser(id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public resetUserPassword = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      if (!newPassword) {
        throw new AppError("New password is required", 400);
      }
      const result = await this.adminService.resetUserPassword(id, newPassword);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  // Enhanced Reporting
  public getSalesReport = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { startDate, endDate } = req.query;
      const result = await this.adminService.getSalesReport({
        startDate: startDate as string,
        endDate: endDate as string,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public getServiceFeeReport = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { startDate, endDate } = req.query;
      const result = await this.adminService.getServiceFeeReport({
        startDate: startDate as string,
        endDate: endDate as string,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  public getTrafficReport = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await this.adminService.getTrafficReport();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}

export default AdminController;
