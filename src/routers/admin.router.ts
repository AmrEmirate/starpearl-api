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
    // All routes require ADMIN role
    this.route.use(this.authMiddleware.verifyToken);
    this.route.use(this.authMiddleware.isAdmin);

    this.route.get("/stats", this.adminController.getStats);

    // Store Management
    this.route.get("/stores/pending", this.adminController.getPendingStores);
    this.route.patch("/stores/:id/verify", this.adminController.verifyStore);

    // Withdrawal Management
    this.route.get(
      "/withdrawals/pending",
      this.adminController.getPendingWithdrawals
    );
    this.route.patch(
      "/withdrawals/:id/process",
      this.adminController.processWithdrawal
    );
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default AdminRouter;
