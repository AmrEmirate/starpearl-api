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
    // Semua route wishlist butuh login
    this.route.use(this.authMiddleware.verifyToken);

    // GET /wishlist - Ambil wishlist user
    this.route.get("/", this.wishlistController.getMyWishlist);

    // POST /wishlist - Tambah item ke wishlist
    this.route.post("/", this.wishlistController.addToWishlist);

    // DELETE /wishlist/:id - Hapus item dari wishlist (by productId)
    this.route.delete("/:id", this.wishlistController.removeFromWishlist);
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default WishlistRouter;
