import { Router } from "express";
import AttributeController from "../controllers/attribute.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

class AttributeRouter {
  private route: Router;
  private controller: AttributeController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.route = Router();
    this.controller = new AttributeController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Public route to get attributes (for sellers/buyers)
    this.route.get("/", this.controller.getAllAttributes);

    // Admin only routes
    this.route.use(this.authMiddleware.verifyToken);
    this.route.use(this.authMiddleware.isAdmin);

    this.route.post("/", this.controller.createAttribute);
    this.route.post("/:id/values", this.controller.addAttributeValue);
    this.route.delete("/:id", this.controller.deleteAttribute);
    this.route.delete("/values/:id", this.controller.deleteAttributeValue);
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default AttributeRouter;
