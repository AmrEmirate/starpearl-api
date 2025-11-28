import { Router } from "express";
import UserController from "../controllers/user.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { updateUserValidation } from "../middleware/validation/user";

class UserRouter {
  private route: Router;
  private userController: UserController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.route = Router();
    this.userController = new UserController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoute();
  }

  private initializeRoute(): void {
    // Rute ini akan dilindungi oleh authMiddleware.verifyToken
    this.route.get(
      "/me",
      this.authMiddleware.verifyToken,
      this.userController.getMyProfile
    );

    this.route.patch(
      "/me",
      this.authMiddleware.verifyToken,
      updateUserValidation,
      this.userController.updateMyProfile
    );

    // POST /users/me/password - Change password
    this.route.post(
      "/me/password",
      this.authMiddleware.verifyToken,
      this.userController.changePassword
    );
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default UserRouter;
