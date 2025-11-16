import { Router } from "express";
import AdminController from "../controllers/admin.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { updateStoreStatusValidation } from "../middleware/validation/admin";

class AdminRouter {
  private route: Router;
  private adminController: AdminController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.route = Router();
    this.adminController = new AdminController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoute();
  }

  private initializeRoute(): void {
    // Lindungi SEMUA rute admin
    this.route.use(
      this.authMiddleware.verifyToken,
      this.authMiddleware.isAdmin // Pastikan hanya Admin yang bisa akses
    );

    // GET /admin/sellers - Mengambil semua data toko
    this.route.get(
      "/sellers",
      this.adminController.getAllSellers
    );

    // PATCH /admin/sellers/:storeId/status - Update status toko
    this.route.patch(
      "/sellers/:storeId/status",
      updateStoreStatusValidation,
      this.adminController.updateSellerStatus
    );
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default AdminRouter;