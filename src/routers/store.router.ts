import { Router } from "express";
import StoreController from "../controllers/store.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

class StoreRouter {
  private route: Router;
  private storeController: StoreController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.route = Router();
    this.storeController = new StoreController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoute();
  }

  private initializeRoute(): void {
    // Lindungi semua rute store, hanya user terotentikasi yang bisa akses
    this.route.use(this.authMiddleware.verifyToken);

    // GET /stores/my-store - (Seller) Mendapatkan profil toko sendiri
    this.route.get(
      "/my-store",
      this.authMiddleware.isSeller,
      this.storeController.getMyStore
    );

    // PATCH /stores/my-store - (Seller) Update profil toko sendiri
    this.route.patch(
      "/my-store",
      this.authMiddleware.isSeller,
      this.storeController.updateMyStore
    );

    // GET /stores/dashboard/stats - (Seller) Get dashboard statistics
    this.route.get(
      "/dashboard/stats",
      this.authMiddleware.isSeller,
      this.storeController.getDashboardStats
    );

    // POST /stores/verification - (Seller) Submit verification documents
    this.route.post(
      "/verification",
      this.authMiddleware.isSeller,
      this.storeController.submitVerification
    );
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default StoreRouter;
