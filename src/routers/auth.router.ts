import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import { uploaderMemory } from "../middleware/uploader";
import {
  registerBuyerValidation,
  registerSellerValidation,
  loginValidation,
} from "../middleware/validation/auth";
import { AuthMiddleware } from "../middleware/auth.middleware";

class AuthRouter {
  private route: Router;
  private authController: AuthController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.route = Router();
    this.authController = new AuthController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoute();
  }

  private initializeRoute(): void {
    this.route.post(
      "/register/buyer",
      registerBuyerValidation,
      this.authController.registerBuyer
    );

    this.route.post(
      "/register/seller",
      registerSellerValidation,
      this.authController.registerSeller
    );

    this.route.post(
      "/login", 
      loginValidation, 
      this.authController.login
    );

    this.route.patch(
      "/profile-img",
      this.authMiddleware.verifyToken,
      uploaderMemory().single("img"),
      this.authController.changeProfileImg
    );
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default AuthRouter;