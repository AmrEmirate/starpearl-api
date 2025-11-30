import { Router } from "express";
import AdminController from "../controllers/admin.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

class AdminRouter {
  private route: Router;
  private adminController: AdminController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.route = Router();
    this.adminController = new AdminController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.route.use(this.authMiddleware.verifyToken);
    this.route.use(this.authMiddleware.isAdmin);

    this.route.get("/stats", this.adminController.getStats);

    this.route.get("/stores/pending", this.adminController.getPendingStores);
    this.route.patch("/stores/:id/verify", this.adminController.verifyStore);

    this.route.get(
      "/withdrawals/pending",
      this.adminController.getPendingWithdrawals
    );
    this.route.patch(
      "/withdrawals/:id/process",
      this.adminController.processWithdrawal
    );

    // Settings
    this.route.get("/settings", this.adminController.getSettings);
    this.route.put("/settings", this.adminController.updateSettings);

    // Content (Banners)
    this.route.get("/content", this.adminController.getBanners);
    this.route.post("/content", this.adminController.createBanner);
    this.route.put("/content/:id", this.adminController.updateBanner);
    this.route.delete("/content/:id", this.adminController.deleteBanner);

    // Promotions
    this.route.get("/promotions", this.adminController.getPromotions);
    this.route.post("/promotions", this.adminController.createPromotion);
    this.route.put("/promotions/:id", this.adminController.updatePromotion);
    this.route.delete("/promotions/:id", this.adminController.deletePromotion);

    // Community Moderation
    this.route.get(
      "/community/posts/pending",
      this.adminController.getPendingPosts
    );
    this.route.patch(
      "/community/posts/:id/status",
      this.adminController.moderatePost
    );

    // Disputes
    this.route.get("/disputes", this.adminController.getDisputes);
    this.route.post(
      "/disputes/:id/resolve",
      this.adminController.resolveDispute
    );

    // User Management
    this.route.get("/users", this.adminController.getAllUsers);
    this.route.patch("/users/:id/suspend", this.adminController.suspendUser);
    this.route.delete("/users/:id", this.adminController.deleteUser);
    this.route.post(
      "/users/:id/reset-password",
      this.adminController.resetUserPassword
    );

    // Enhanced Reporting
    this.route.get("/reports/sales", this.adminController.getSalesReport);
    this.route.get(
      "/reports/service-fee",
      this.adminController.getServiceFeeReport
    );
    this.route.get("/reports/traffic", this.adminController.getTrafficReport);
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default AdminRouter;
