import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import logger from "../utils/logger";
import { RequestWithUser } from "../middleware/auth.middleware";

class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public registerBuyer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.registerBuyer(req.body);
      res.status(201).send({
        success: true,
        message: "Buyer registered successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Error in registerBuyer controller", error);
      next(error);
    }
  };

  public registerSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.registerSeller(req.body);
      res.status(201).send({
        success: true,
        message: "Seller registration pending approval",
        data: result,
      });
    } catch (error) {
      logger.error("Error in registerSeller controller", error);
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.login(req.body);
      res.status(200).send({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      logger.error("Error in login controller", error);
      next(error);
    }
  };

  public changeProfileImg = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.id) {
        throw new Error("User not authenticated");
      }
      if (!req.file) {
        throw new Error("No file uploaded");
      }

      const result = await this.authService.updateProfileImage(req.user.id, req.file);
      res.status(200).send({
        success: true,
        ...result,
      });
    } catch (error) {
      logger.error("Error in changeProfileImg controller", error);
      next(error);
    }
  };
}

export default AuthController;
