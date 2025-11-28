import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import logger from "../utils/logger";
import { RequestWithUser } from "../middleware/auth.middleware";
import AppError from "../utils/AppError";

class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public getMyProfile = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication failed", 401);
      }
      const result = await this.userService.getUserProfile(req.user.id);
      res.status(200).send({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error("Error in getMyProfile controller", error);
      next(error);
    }
  };

  public updateMyProfile = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication failed", 401);
      }
      const result = await this.userService.updateUserProfile(
        req.user.id,
        req.body
      );
      res.status(200).send({
        success: true,
        message: "Profile updated successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Error in updateMyProfile controller", error);
      next(error);
    }
  };

  public changePassword = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new AppError("Authentication failed", 401);
      }

      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        throw new AppError("Old password and new password are required", 400);
      }

      const result = await this.userService.changePassword(req.user.id, {
        oldPassword,
        newPassword,
      });

      res.status(200).send({
        success: true,
        message: "Password updated successfully",
        data: result,
      });
    } catch (error) {
      logger.error("Error in changePassword controller", error);
      next(error);
    }
  };
}

export default UserController;
