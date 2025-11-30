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
    this.route.use(this.authMiddleware.verifyToken);

    this.route.get(
      "/my-store",
      this.authMiddleware.isSeller,
      this.storeController.getMyStore
    );

    this.route.patch(
      "/my-store",
      this.authMiddleware.isSeller,
      this.storeController.updateMyStore
    );

    this.route.get(
      "/dashboard/stats",
      this.authMiddleware.isSeller,
      this.storeController.getDashboardStats
    );

    this.route.post(
      "/verification",
      this.authMiddleware.isSeller,
      this.storeController.submitVerification
    );

    // Public Store Profile
    this.route.get("/:id", this.storeController.getStoreById);

    // Follow/Unfollow
    this.route.post(
      "/:id/follow",
      this.authMiddleware.verifyToken,
      this.storeController.followStore
    );
    this.route.delete(
      "/:id/follow",
      this.authMiddleware.verifyToken,
      this.storeController.unfollowStore
    );
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default StoreRouter;
