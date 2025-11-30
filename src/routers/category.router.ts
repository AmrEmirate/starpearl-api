import { Router } from "express";
import CategoryController from "../controllers/category.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

class CategoryRouter {
  private route: Router;
  private controller: CategoryController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.route = Router();
    this.controller = new CategoryController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.route.get("/", this.controller.getAllCategories);

    // Admin only routes
    this.route.post(
      "/",
      this.authMiddleware.verifyToken,
      this.authMiddleware.isAdmin,
      this.controller.createCategory
    );
    this.route.patch(
      "/:id",
      this.authMiddleware.verifyToken,
      this.authMiddleware.isAdmin,
      this.controller.updateCategory
    );
    this.route.delete(
      "/:id",
      this.authMiddleware.verifyToken,
      this.authMiddleware.isAdmin,
      this.controller.deleteCategory
    );
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default CategoryRouter;
