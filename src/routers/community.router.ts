import { Router } from "express";
import CommunityController from "../controllers/community.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

class CommunityRouter {
  private route: Router;
  private controller: CommunityController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.route = Router();
    this.controller = new CommunityController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoute();
  }

  private initializeRoute(): void {
    this.route.get(
      "/",
      this.authMiddleware.extractUser,
      this.controller.getPosts
    );

    this.route.use(this.authMiddleware.verifyToken);

    this.route.post("/", this.controller.createPost);
    this.route.post("/:postId/like", this.controller.likePost);
    this.route.post("/:postId/comment", this.controller.addComment);
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default CommunityRouter;
