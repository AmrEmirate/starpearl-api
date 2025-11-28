import { Router } from "express";
import WishlistController from "../controllers/wishlist.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

class WishlistRouter {
  private route: Router;
  private wishlistController: WishlistController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.route = Router();
    this.wishlistController = new WishlistController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoute();
  }

  private initializeRoute(): void {
    this.route.use(this.authMiddleware.verifyToken);

    this.route.get("/", this.wishlistController.getMyWishlist);

    this.route.post("/", this.wishlistController.addToWishlist);

    this.route.delete("/:id", this.wishlistController.removeFromWishlist);
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default WishlistRouter;
